const summarizeBtn = document.getElementById("summarize-btn");
const summaryText = document.getElementById("summary-text");
const result = document.getElementById("result");

// Listens for the button tap
summarizeBtn.addEventListener("click", async () => {
    summarizeBtn.textContent = "Summarizing...";
    summarizeBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true}, async (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getPageText"}, async (response) => {
            const pageText = response.text;

            // Sends the page text as a JSON
            const res = await fetch("tab-summarizer.vercel.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify({ text: pageText })
            });

            // Gets a response from Vercel - grabs the summary and display it
            const data = await res.json();
            summaryText.textContent = data.summary;
            result.style.display = "block";

            summarizeBtn.textContent = "Summarize this page";
            summarizeBtn.disabled = false;
        })
    })

})