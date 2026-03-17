document.addEventListener("DOMContentLoaded", () => {
    const summarizeBtn = document.getElementById("summarize-btn");
    const summaryText = document.getElementById("summary-text");
    const result = document.getElementById("result");

    summarizeBtn.addEventListener("click", async () => {
        summarizeBtn.textContent = "Summarizing...";
        summarizeBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => ({ text: document.body.innerText, title: document.title })
            }, async (results) => {
                try {
                    if (!results || !results[0] || !results[0].result) {
                        summaryText.textContent = "Could not read page content. Please refresh and try again.";
                        result.style.display = "block";
                        summarizeBtn.textContent = "Summarize this page";
                        summarizeBtn.disabled = false;
                        return;
                    }

                    const { text: rawText, title } = results[0].result;
                    const pageText = rawText.slice(0, 5000);

                    const res = await fetch("https://tab-summarizer.vercel.app/api/summarize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-request-id": atob("dHlkZGJodWJmaG5qYmpiZmhieXJqZGFvaHlleWV1cW91aGRubXN4bQ==")
                        },
                        body: JSON.stringify({ text: pageText })
                    });

                    const data = await res.json();
                    summaryText.innerHTML = `<h2>${title}</h2>` + data.summary
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^- (.+)/gm, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                        .replace(/\n\n/g, '<br><br>');
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