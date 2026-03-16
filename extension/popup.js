document.addEventListener("DOMContentLoaded", () => {
    const summarizeBtn = document.getElementById("summarize-btn");
    const summaryText = document.getElementById("summary-text");
    const result = document.getElementById("result");

    summarizeBtn.addEventListener("click", async () => {
        summarizeBtn.textContent = "Summarizing...";
        summarizeBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });

            // Wait for content script to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, async (response) => {
                try {
                    // Guard against empty response
                    if (!response || !response.text) {
                        summaryText.textContent = "Could not read page content. Please refresh and try again.";
                        result.style.display = "block";
                        summarizeBtn.textContent = "Summarize this page";
                        summarizeBtn.disabled = false;
                        return;
                    }

                    const pageText = response.text.slice(0, 5000);

                    const res = await fetch("https://tab-summarizer.vercel.app/api/summarize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ text: pageText })
                    });

                    const data = await res.json();
                    summaryText.textContent = data.summary;
                    result.style.display = "block";

                    summarizeBtn.textContent = "Summarize this page";
                    summarizeBtn.disabled = false;
                } catch (error) {
                    console.log("Error:", error.message);
                    summaryText.textContent = "Something went wrong. Please try again.";
                    result.style.display = "block";
                    summarizeBtn.textContent = "Summarize this page";
                    summarizeBtn.disabled = false;
                }
            });
        });
    });
});