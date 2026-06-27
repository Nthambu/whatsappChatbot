require('dotenv').config();
const axios = require('axios');

const USE_GROQ = process.env.USE_GROQ === 'true';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateText(prompt, { groqModel = "llama-3.3-70b-versatile" } = {}) {

    if (USE_GROQ) {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: groqModel,
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
                timeout: 30000
            }
        );
        return response.data.choices[0]?.message?.content?.trim();
    }

    // Local Ollama fallback
    const response = await axios.post(
        "http://localhost:11434/api/generate",
        {
            model: "llama3.2:3b",
            prompt,
            stream: false
        },
        { timeout: 300000 }
    );
    return response.data.response?.trim();
}

module.exports = { generateText };