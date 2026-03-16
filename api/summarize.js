// Forwards text to summarize and recieves the summary back
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    if(req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const { text } = body;

        const groqRes = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "user",
                            content: `Summarize the following webpage in exactly 3 bullet points. Be concise, one sentence per bullet point. No intro, no conclusion, just the 3 bullets.

- 
- 
-

Webpage content:
${text}`
                        }
                    ]
                })
            }
        );
        const groqData = await groqRes.json();
        const summary = groqData.choices[0].message.content;
        res.status(200).json({ summary: summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}