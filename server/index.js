const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const extractState = require("./stateExtractor");
const extractProfile = require("./profileExtractor");
const { generateText } = require("./llm");
app.listen(port, () => {
  
});

// =========================
// MEMORY STORAGE
// =========================


const {
    database,
    saveMemory
} = require("./memory");
const conversations = {};
const userStates = {};
const clientProfiles = {};
for (const user in database) {

    conversations[user] =
        database[user].history || [];

    userStates[user] =
        database[user].state || {
            serviceType: "",
            project: "",
            businessName: "",
            budget: "",
            timeline: "",
            stage: "new_lead",
            leadStatus: "new"
        };

    clientProfiles[user] =
        database[user].profile || {
            name: "",
            businessName: "",
            industry: "",
            products: "",
            location: "",
            deliveryArea: "",
            notes: ""
        };
}

// =========================
// WHATSAPP CLIENT
// =========================

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client_one"
    }),
    puppeteer: {
        headless: false
    }
});

client.on("qr", qr => {
    qrcode.generate(qr, {
        small: true
    });
});

client.on("ready", () => {
    console.log("Client is ready!");
});

// =========================
// MESSAGE HANDLER
// =========================

client.on("message", async (message) => {

    try {

        if (message.isStatus) return;
        if (message.fromMe) return;
        if (message.from.includes('@g.us')) return;
        if (message.from.endsWith('@newsletter')) return;

        const userId = message.from;
        // =========================
        // CREATE MEMORY
        // =========================

       
if (!conversations[userId]) {
    conversations[userId] = [];
    console.log('conversations',conversations[userId])
}
if (!clientProfiles[userId]) {
    clientProfiles[userId] = {
        name: "",
        businessName: "",
        industry: "",
        products: "",
        location: "",
        deliveryArea: "",
        notes: ""
    };

}
if (!userStates[userId]) {

    userStates[userId] = {
        serviceType: "",
        project: "",
        businessName: "",
        budget: "",
        timeline: "",
        stage: "new_lead",
        leadStatus: "new"
    };
}

        // =========================
        // STATE EXTRACTION
        // =========================

const state = userStates[userId];
        // =========================
        // STORE USER MESSAGE
        // =========================

        conversations[userId].push(
            `User: ${message.body}`
        );
        if (conversations[userId].length > 10) {
            conversations[userId].shift();
        }
const chatHistory =
    conversations[userId].join("\n");
console.log('chatHistroy',chatHistory);
        // =========================
        // AI REQUEST
        // =========================

  

             const  prompt= `
You are Frank chatting on WhatsApp.

You ARE Frank.

Never say:
- "Ask Frank"
- "Frank can help"
- "Frank will contact you"

Speak as the business owner.

Current Client State:

${JSON.stringify(
    userStates[userId],
    null,
    2
)}

Client Profile:

${JSON.stringify(
    clientProfiles[userId],
    null,
    2
)}

Rules:

- Continue ongoing conversations.
- Never restart context.
- Never reintroduce yourself.
- Remember previous discussion.
- Use the stored client information.
- Ask ONE question at a time.
- Keep replies concise.
- Sound natural.
- Understand Kenyan English and Sheng.

Services:

- Portfolio websites
- Business websites
- Rental management systems
- SaaS products
- AI automation
- WhatsApp chatbots
- ISP billing systems
- UI/UX design
- Enterprise systems

Sales Process:

1. Understand requirements
2. Gather missing details
3. Estimate timeline
4. Estimate budget
5. Confirm project
6. Move client to implementation

Important:

If information already exists,
do NOT ask again.

Conversation:

${chatHistory}

User:
${message.body}

Frank:
`;
const aiReply = await generateText(prompt);
      
        if (!aiReply) {
            console.log("NO AI RESPONSE");
            return;
        }

        console.log("USER:", message.body);
        console.log("AI:", aiReply);
await message.reply(aiReply);
     conversations[userId].push(
    `Frank: ${aiReply}`
);

if (conversations[userId].length > 10) {
    conversations[userId].shift();
}
      saveMemory(
    conversations,
    userStates,
    clientProfiles
);
const extractedState =
    await extractState(
        chatHistory,
        state
    );

Object.keys(extractedState).forEach(key => {

    if (
        extractedState[key] &&
        extractedState[key].trim() !== ""
    ) {
        state[key] =
            extractedState[key];
    }

});

userStates[userId] = state;
const extractedProfile =
    await extractProfile(
        chatHistory,
        clientProfiles[userId]
    );

Object.keys(extractedProfile).forEach(key => {

    if (
        extractedProfile[key] &&
        extractedProfile[key].trim() !== ""
    ) {

        clientProfiles[userId][key] =
            extractedProfile[key];

    }

});

    } catch (error) {

        console.log(
            "ERROR:",
            error.response?.data || error.message
        );

    }

});

client.initialize();