const axios = require("axios");
const { generateText } = require("./llm");
async function extractState(message, currentState) {
    try {
             const prompt= `
You are an information extraction engine.

Current State:

${JSON.stringify(currentState, null, 2)}

User Message:

${message}
Extract client information from the message.

Rules:

- Only update fields if the user explicitly provides information.
- Never erase existing values.
- If information is not mentioned, return an empty string for that field.
- Return ONLY valid JSON.
- No markdown.
- No explanations.

Possible stages:
- new_lead
- requirements_gathering
- quotation
- negotiation
- confirmed
- completed

Current State:
${JSON.stringify(currentState,null,2)}

User Message:
${message}
`;
          const raw = await generateText(prompt, { groqModel: "llama-3.1-8b-instant" });

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return currentState;

        return JSON.parse(jsonMatch[0]);


    } catch (err) {
a
         console.log("STATE EXTRACTOR ERROR", err.response?.data || err.message);
        return currentState;
    }
}

module.exports = extractState;