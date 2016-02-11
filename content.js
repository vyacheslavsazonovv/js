var gmail = null,

    api_token = "b1b6f6938c96e3be0e42de3d61777015",
    username = "tom@quiversoftware.com",
    user_domain = "quiversoftware.com",

    recipientList = [],
    regexObj = {},
    logid = 0,
    regex_filters_return = {},
    has_attachment = false,
    num_attachments = 0,
    attachments = [];

$(window).load(function() {

    $("div.T-I.J-J5-Ji.T-I-KE.L3").on("click", function(){
        recipientList = [];
    });

    exGetLastSync();
    setInterval(function(){
        exGetLastSync();
    }, 1800000);

    function exGetLastSync() {
        var objGetLastSync = {
            cr_action: "get_last_sync",
            api_token: api_token,
            username: username,
            user_domain: user_domain,
            version: "1.5.1.9",
            addin_version: "1.5.17.0",
            just_opened: true,
            show_signature: false
        };
        var jsonGetLastSync = JSON.stringify(objGetLastSync);

        $.ajax({
            dataType: "json",
            type: "POST",
            data: jsonGetLastSync,
            contentType: "application/json",
            url: "https://quiverlive.getcheckrecipient.com/api_external/get_last_sync",
            success: function (data) {
                var regexCompressed = data["regex"];
                var regexDecompressed = JXG.decompress(regexCompressed);
                regexObj = JSON.parse(regexDecompressed);
                console.log(regexDecompressed);
            },
            error: function () {
                console.log("ERROR");
            }
        })
    }

});

gMailManager = {

    eventInitialized: false,
    entityId: "",

    addModalFrame: function () {

        if ($(".modal-dialog").length > 0)
            return;

        if (gmail === null) {
            gmail = new Gmail($);

            gmail.observe.on("send_message", function (url, body, data, xhr) {
                console.log("url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
            });
        }

        var self = this,
            $body = $("body"),
            $modal = $("<div/>", {
                class: "modal fade",
                id: "check-recipient-xt-modal",
                role: "dialog"
            }),
            $sendButton = $(".T-I.J-J5-Ji.aoO.T-I-atl.L3"),
            $modalDialog = $("<div/>", {class: "modal-dialog"}),
            $modalContent = $("<div/>", {class: "modal-content"}),
            $modalHeader = $("<div/>", {class: "modal-header"}).append(
                $("<h4/>", {
                    class: "modal-title",
                    id: "modal-title"
                }).text("CheckRecipient Example Warning")
            ),
            $modalBody = $("<div/>", {class: "modal-body"}),

            $modalResponseMessage = $("<div/>", {
                id: "check-recipient-message"
            }),
            $modalResponseMessageMore = $("<div/>", {
                id: "check-recipient-message-more",
                style: "display:none"
            }),
            $modalToggle = $("<a/>", {
                id: "check-recipient-toggle"
            }).text("Click here to learn why CheckRecipient has flagged this email"),

            $modalFooter = $("<div/>", {class: "modal-footer"}),
            $modalBackButton = $("<button/>", {
                "data-dismiss": "modal",
                id: "modal-dismiss",
                style: "display:none"
            }),
            $modalNoButton = $("<button/>", {
                class: "btn btn-default",
                id: "modal-no"
            }).text("No"),
            $modalSendButton = $("<button/>", {
                class: "btn btn-primary",
                id: "modal-send"
            }).text("Yes").prop("disabled", true);

        $("<div/>", {class: "form-group"}).append($modalResponseMessage).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalResponseMessageMore).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalToggle).appendTo($modalBody);

        $modalFooter.append($modalBackButton, $modalNoButton, $modalSendButton);
        $modalContent.append($modalHeader, $modalBody, $modalFooter).appendTo($modalDialog);
        $modal.append($modalDialog).appendTo($body);

        $modalSendButton.click(function () {
            dataUserResponse("yes");
            $sendButton.click();
            $modalBackButton.click();
            recipientList = [];
        });

        $modalNoButton.click(function () {
            dataUserResponse("no");
            $modalBackButton.click();
        });

        function dataUserResponse(YesOrNo){
            var objUserResponse = {
                action: "user_response",
                username: username,
                rb_username: "",
                user_domain: "checkrecipient.com",
                api_token: api_token,
                product: "ai",
                log_id: logid,
                response: YesOrNo,
                yes_and_add_response: "",
                version: "1.5.1.0"
            };
            var jsonUserResponse = JSON.stringify(objUserResponse);

            $.ajax({
                dataType: "json",
                type: "POST",
                data: jsonUserResponse,
                contentType: "application/json",
                url: "https://quiverlive.getcheckrecipient.com/api_external/user_response",
                success: function (data) {
                    console.log(data);
                },
                error: function () {
                    console.log("ERROR");
                }
            });
        }
    },

    displayApiResponse: function (data) {
        $("#check-recipient-xt-modal #modal-send").prop("disabled", false);
        $("#check-recipient-xt-modal #check-recipient-title").val(data.title);
    },

    addSendButtonEventHandler: function () {
        regex_filters_return = {};

        var self = this,
            $sendButton = $(".T-I.J-J5-Ji.aoO.T-I-atl.L3"),
            $messageForm = $("div.AD table form"),
            $newSendButton = $("<div/>", {
                class: "T-I J-J5-Ji aoO T-I-atl L3",
                role: "button",
                "data-tooltip": "Send ‪(Ctrl-Enter)‬",
                "aria-label": "Send ‪(Ctrl-Enter)‬",
                "data-tooltip-delay": 800
            }).css({
                "-webkit-user-select": "none"
            }).text("Send");

        self.addModalFrame();

        if (!self.eventInitialized) {
            self.eventInitialized = true;
            $sendButton.hide();
            $newSendButton.appendTo($sendButton.parent());
            $newSendButton.click(function () {

                var $parentTable = $(this).parents("table.aoP.aoC"),
                    $email = $($parentTable.find("form table.GS div.vR div.vT")[0]),
                    $subject = $parentTable.find("form div.aoD.az6 input[name='subjectbox']"),
                    $body = $parentTable.find("div.Am.Al.editable.LW-avf"),
                    $emailAttachments = $parentTable.find("div.GW .dL"),
                    email = ($email) ? $email.text() : "",
                    emailSubject = $subject.val(),
                    emailBodyHtml = $body.contents(),
                    emailBody = "",
                    emailAttachments = "test";

                num_attachments = 0;
                attachments = [];
                $.each($emailAttachments, function(attK, attV){
                    num_attachments++;
                    var emailAttFile = $(attV).find("a.dO div.vI").text();
                    var emailAttFileSize = $(attV).find("a.dO div.vJ").text();
                    var attachment = {
                        name: emailAttFile,
                        extension: emailAttFile.replace(/^.*\./, ""),
                        attachment_words: ""
                    };
                    attachments.push(attachment);
                    if(num_attachments > 0) { has_attachment = true } else { has_attachment = false }
                });

                $(emailBodyHtml).each(function(){
                    emailBody = emailBody + $(this).text() + "\n";
                });

                pageClear();
                $("#check-recipient-xt-modal").modal({backdrop: 'static', keyboard: false});
                $("#check-recipient-xt-modal #modal-send").prop("disabled", true);

                for(var filterKey in regexObj) {
                    var checkedFilter = checkFilters(regexObj[filterKey], emailBody, emailSubject, emailAttachments);
                    if(checkedFilter.length > 0){
                        regex_filters_return[filterKey] = checkedFilter;
                    }
                }

                function checkFilters(filter, emailBody, emailSubject, emailAttachment) {
                    var filterA_matches = [],
                        filterB_matches = [],
                        filterC_matches = [],

                        filter_obj = new RegExp(regexCorrect(filter["s_1"]), "g"),
                        filter_obj2 = new RegExp(regexCorrect(filter["s_2"]), "g"),
                        filter_obj3 = new RegExp(regexCorrect(filter["s_3"]), "g"),

                        scopeArr = filter.scope,
                        scopeKeyValue = [],
                        location = "",
                        chars = 0,
                        searchStr = "",
                        foundItem = "",
                        found_list = [],
                        newBody = "",
                        oldBody = "",
                        oldBodyIndex = -1;

                    var oldBodyMatch = emailBody.match(/<[\w\d@.]+>\swrote:/);
                    if(oldBodyMatch){
                        oldBodyIndex = oldBodyMatch["index"];
                    }
                    if(oldBodyIndex < 1){
                        newBody = emailBody;
                        oldBody = "";
                    } else {
                        newBody = emailBody.substring(0, oldBodyIndex - 1);
                        oldBody = emailBody.substring(oldBodyIndex, emailBody.length);
                    }

                    $.each(scopeArr, function(scopeK, scope){
                        scopeKeyValue = scope.split("-");
                        location = scopeKeyValue[0];
                        chars = scopeKeyValue[1];

                        switch(location) {
                            case "b":
                                if( chars == 0 ) { searchStr = emailBody; } else { searchStr = emailBody.substr(0, chars); }
                                break;
                            case "s":
                                if( chars == 0 ) { searchStr = emailSubject; } else { searchStr = emailSubject.substr(0, chars); }
                                break;
                            case "n":
                                if( chars == 0 ) { searchStr = newBody; } else { searchStr = newBody.substr(0, chars); }
                                break;
                            case "o":
                                if( chars == 0 ) { searchStr = oldBody; } else { searchStr = oldBody.substr(0, chars); }
                                break;
                            case "a":
                                //console.log("attachment", "--------", chars);
                                break;
                            default:
                                searchStr = "";
                        }

                        if(searchStr){
                            if(!filter["s_1_r"]){
                                filterA_matches = searchStr.match(filter_obj);
                                if(filterA_matches){
                                    delete filterA_matches["index"];
                                    delete filterA_matches["input"];
                                    if(filter["s_2"]){
                                        $.each(filterA_matches, function(matchA, matchAvalue){
                                            if(!filter["s_2_r"]){
                                                filterB_matches = matchAvalue.match(filter_obj2);
                                                if(filterB_matches){
                                                    delete filterB_matches["index"];
                                                    delete filterB_matches["input"];
                                                    if(filter["s_3"]){
                                                        $.each(filterB_matches, function(matchB, matchBvalue){
                                                            if(!filter["s_3_r"]){
                                                                filterC_matches = matchBvalue.match(filter_obj3);
                                                                if(filterC_matches){
                                                                    delete filterC_matches["index"];
                                                                    delete filterC_matches["input"];
                                                                    $.each(filterC_matches, function(matchC, matchCvalue){
                                                                        foundItem = matchCvalue.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                                                        if($.inArray(foundItem, found_list) == -1) {
                                                                            found_list.push(foundItem);
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                foundItem = matchBvalue.replace(filter_obj3, "");
                                                                if(foundItem){
                                                                    foundItem = foundItem.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                                                    if($.inArray(foundItem, found_list) == -1) {
                                                                        found_list.push(foundItem);
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    } else {
                                                        $.each(filterB_matches, function(matchB, matchBvalue){
                                                            foundItem = matchBvalue.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                                            if($.inArray(foundItem, found_list) == -1) {
                                                                found_list.push(foundItem);
                                                            }
                                                        })
                                                    }
                                                }
                                            } else {
                                                if(matchAvalue) {
                                                    foundItem = matchAvalue.replace(filter_obj2, "");
                                                    if (foundItem) {
                                                        foundItem = foundItem.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                                        if ($.inArray(foundItem, found_list) == -1) {
                                                            found_list.push(foundItem);
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        $.each(filterA_matches, function(matchA, matchAvalue){
                                            if(matchAvalue){
                                                foundItem = matchAvalue.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                                if($.inArray(foundItem, found_list) == -1) {
                                                    found_list.push(foundItem);
                                                }
                                            }
                                        })
                                    }
                                }
                            } else {
                                foundItem = searchStr.replace(filter_obj, "");
                                if(foundItem){
                                    foundItem = foundItem.replace(/^\s+|\s+$/gm, "").toLowerCase();
                                    if($.inArray(foundItem, found_list) == -1) {
                                        found_list.push(foundItem);
                                    }
                                }
                            }
                        }
                    });
                    return found_list;
                }

                function regexCorrect(regexUncorrect){
                    return regexUncorrect.replace(/(\?i:)+/g, "");
                }


                var jsonData = dataCheckEmail(recipientList);
                $.ajax({
                    dataType: "json",
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    url: "https://quiverlive.getcheckrecipient.com/api_external/check_email",
                    success: function (data) {
                        console.log(data);

                        logid = data["log_id"];

                        var message = data["message"],
                        more = data["more_detail"];
                        if (message == "") {
                            message = "No Message";
                        }
                        if (more == "") {
                            more = "No More Details";
                        }

                        $("#check-recipient-xt-modal #check-recipient-message").text(message);
                        $("#check-recipient-xt-modal #check-recipient-message-more").text(more);
                    },
                    error: function () {
                        console.log("ERROR");
                    }
                });

                var toggled = false;
                pageSwitchMain();

                $("a#check-recipient-toggle").on("click", function(){
                    if(toggled) {
                        pageSwitchMain();
                    } else {
                        pageSwitchMore();
                    }
                });
                function pageSwitchMain(){
                    toggled = false;
                    $("div#check-recipient-message").css("display", "block");
                    $("div#check-recipient-message-more").css("display", "none");
                    $("a#check-recipient-toggle").text("Click here to learn why CheckRecipient has flagged this email");
                }
                function pageSwitchMore(){
                    toggled = true;
                    $("div#check-recipient-message").css("display", "none");
                    $("div#check-recipient-message-more").css("display", "block");
                    $("a#check-recipient-toggle").text("Return");
                }
                function pageClear(){
                    $("#check-recipient-xt-modal #check-recipient-message").text("");
                    $("#check-recipient-xt-modal #check-recipient-message-more").text("");
                }

                chrome.extension.sendMessage({msg: "api-call"});
            });

            var recipient = {},
                recipientAddress = "",
                similarRecipient = {},
                similarRecipientList = [];

            $("div.wO").on("DOMNodeInserted", function (e) {

                var matchLength = $(this).children(".vO").val().length;

                if ($(e.target).is("div.vR")) {
                    recipientAddress = $(e.target).find(".vN").attr("email");
                    var weight = 0;

                    $("div.ah.aiv.aJS div.am").each(function () {
                        if ($(this).children("div.ao5").length > 0) {
                            similarRecipient["name"] = $(this).children(".ao5").text();
                            similarRecipient["address"] = $(this).children(".Sr").text();
                        } else {
                            similarRecipient["name"] = "";
                            similarRecipient["address"] = $(this).text();
                        }
                        similarRecipient["email_name"] = "";
                        similarRecipient["email_domain"] = "";
                        similarRecipient["weight"] = ++weight;
                        similarRecipient["address_match_length"] = matchLength;
                        similarRecipient["name_match_length"] = matchLength;

                        similarRecipientList.push(similarRecipient);
                        similarRecipient = {};
                    });

                    recipient["address"] = recipientAddress;
                    recipient["name"] = "";
                    recipient["email_name"] = "";
                    recipient["email_domain"] = "";
                    recipient["recipient_type"] = 1;
                    recipient["weight"] = 14848;
                    recipient["similar_addresses"] = similarRecipientList;
                    recipient["similar_addresses_new_str"] = "";
                    recipient["similar_addresses_new"] = "";

                    recipientList[recipientAddress] = recipient;
                    similarRecipientList = [];
                    recipient = {};

                }
                //console.log(recipientList);
            });

            $("div.wO").on("DOMNodeRemoved", function (e) {

                if ($(e.target).is("div.vR")) {
                    recipientAddress = $(e.target).find(".vN").attr("email");
                    delete recipientList[recipientAddress];
                }
                //console.log(recipientList);
            });

        }
    },

    init: function () {
        var self = this;
        console.log("gmail manager initializing...");
    }
};

$(window).hashchange(function () {
    var hashcode = window.location.hash;
    if (hashcode.indexOf("?compose=") > -1) {
        gMailManager.addSendButtonEventHandler();
        console.log("Link bar timer logging ....");
    } else {
        gMailManager.eventInitialized = false;
    }
});

$("html").bind("keypress", function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
        return false;
    }
});

function dataCheckEmail(recipientsData) {

    var recipients = [],
        tmpRecipient,
        weight = 0,
        rb_recipients = [];

    for(var recipientData in recipientsData){
        rb_recipients.push(recipientData);
        tmpRecipient = recipientsData[recipientData];
        tmpRecipient["weight"] = ++weight;
        recipients.push(tmpRecipient);
    }

    var objCheckEmail = {
        cr_action: "check_email",
        api_token: api_token,
        username: username,
        rb_username: "",
        user_domain: user_domain,
        version: "1.5.1.9",
        device: "gmail",
        recipients: recipients,
        rb_recipients: rb_recipients,
        reply_to: " <7F651A1EJSIFF428B3239A37DF227959C544469@ldsexchange01.thoj.local>",
        num_attachments: num_attachments,
        size_attachments: "0.0",
        sandpit_client: false,
        rules: "",
        email_type: "new_email",
        attachment_extensions: "",
        has_attachment: has_attachment,
        attachments: attachments,
        subject_words: "",
        regex_filters_return: regex_filters_return
    };

    var jsonCheckEmail = JSON.stringify(objCheckEmail);
    return jsonCheckEmail;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.msg) {
        case "api-response":
            data = request.data;
            gMailManager.displayApiResponse(data);
            break;

        default:
            break;
    }
});