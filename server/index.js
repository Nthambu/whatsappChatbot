
const {Client,LocalAuth, AuthStrategy, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const {OpenAI} = require("openai");
const app = express();
const axios=require('axios');
const port = 3000;
app.listen(port, () => {
  //console.log(` app listening on port ${port}`)
})
const allSessionsObject={}
//Starting point for interacting with the WhatsApp Web API
const client = new Client({
  authStrategy:new LocalAuth({
    clientId:"client_one"
  }),
 puppeteer:{
  headless:false,
 }
});
//listening for qr code event whenever it is generated
client.on("qr",(qr)=>{
  qrcode.generate(qr,{small:true})
});
client.on('ready', () => {
   // console.log('Client is ready!');
});
const conversations={};

client.on("message",async (message)=>{
  try{
if(message.isStatus)return;
if(message.fromMe)return;
if(message.from.includes('@g.us'))return;
      // Create memory
if(!conversations[message.from]){
  conversations[message.from]=[];
}
conversations[message.from].push(`User:${message.body}`);
if(conversations[message.from].length>6){
  //keep only recent messages
  conversations[message.from].shift()
}
const chatHistory=conversations[message.from].join('\n')

const response = await axios.post('http://localhost:11434/api/generate',{
  model:"llama3",
  prompt:`You are Frank chatting with people on WhatsApp.

You are:
- friendly
- conversational
- confident
- human-like

IMPORTANT RULES:
- NEVER say "ask Frank"
- NEVER talk about Frank in third person
- YOU ARE Frank
- NEVER repeatedly introduce yourself
- NEVER restart conversations
- ALWAYS continue from previous context
- Keep replies short and natural
- Avoid long explanations unless user asks
- Do not explain coding or development process
- Do not generate source code

SERVICES YOU OFFER:
- portfolio websites
- business websites
- rental management systems
- AI automation
- WhatsApp chatbots
- SaaS systems
- frontend development
- UI/UX design
- custom web applications

WHEN SOMEONE WANTS A SERVICE:
1. Understand their requirements first
2. Ask one question at a time
3. Be conversational
4. Estimate timeline and pricing only after understanding requirements

CASUAL CONVERSATIONS:
- Talk naturally
- Understand Sheng/slang
- Avoid robotic replies
- Avoid customer support tone

Conversation:
${chatHistory}

Frank:

`,
 stream:false
})
const aiReply=response.data.response;
console.log('user',message.body);
console.log('message',aiReply);

if(!aiReply){
   console.log("NO AI RESPONSE");
   return;
}
 // Store AI response
conversations[message.from].push(
   `Assistant: ${aiReply}`
);
await message.reply(aiReply);

}catch(error){
   console.log(error);
}
})

client.initialize();
