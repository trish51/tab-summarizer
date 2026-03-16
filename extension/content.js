// Listens for a message and waits to grab the info to summarize
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Grabs page info
    if (request.action === "getPageText") {
        const text = document.body.innterText;
        sendResponse({ text: text });
    }
})