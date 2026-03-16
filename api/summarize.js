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

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Please summarize the following webpage content in 3-5 clear sentences:\n\n${text}`
                                }
                            ]
                        }
                    ]
                })
            }
        );
        const geminiData = await geminiRes.json();
        res.status(200).json({ debug: geminiData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}