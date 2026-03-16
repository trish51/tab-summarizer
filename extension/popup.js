document.addEventListener("DOMContentLoaded", () => {
    const summarizeBtn = document.getElementById("summarize-btn");
    const summaryText = document.getElementById("summary-text");
    const result = document.getElementById("result");

    // Listens for the button tap
    summarizeBtn.addEventListener("click", async () => {
        summarizeBtn.textContent = "Summarizing...";
        summarizeBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];

            // Inject content script programmatically
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });

            chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, async (response) => {
                try {
                    const pageText = response.text.slice(0, 5000);

                    // Sends the page text as a JSON
                    const res = await fetch("https://tab-summarizer.vercel.app/api/summarize", {
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
                } catch (error) {
                    summaryText.textContent = "Something went wrong. Please try again.";
                    result.style.display = "block";
                    summarizeBtn.textContent = "Summarize this page";
                    summarizeBtn.disabled = false;
                }
            });
        });
    });
});