console.log("CheckRecipient extension installed.");

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.msg) {
		case "api-call":
			$.ajax({
				url: "http://jsonplaceholder.typicode.com/posts/1",
				success: function(response) {
					chrome.tabs.sendMessage(sender.tab.id, {msg: "api-response", data: response});
				}
			});
			break;

		default:
			console.log("Default mode catched.");
			break;
	}
});