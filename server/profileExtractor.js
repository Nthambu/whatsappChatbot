const axios = require("axios");

async function extractProfile(message, currentProfile) {

    try {
            const prompt= `
Extract business profile information.

Current Profile:

${JSON.stringify(currentProfile,null,2)}

Message:

${message}

Return ONLY JSON:

{
  "name":"",
  "businessName":"",
  "industry":"",
  "products":"",
  "location":"",
  "deliveryArea":"",
  "notes":""
}
`;

       const raw = await generateText(prompt, { groqModel: "llama-3.1-8b-instant" });

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return currentState;

        return JSON.parse(jsonMatch[0]);

    } catch {

        return {};

    }

}

module.exports = extractProfile;