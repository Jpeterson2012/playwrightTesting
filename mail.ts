//node --env-file .env {file name}
const MailosaurClient = require("mailosaur");
console.log(process.env.APIKEY)
async function mail(){
    // Find your API key at https://mailosaur.com/app/keys
    // const mailosaur = new MailosaurClient(process.env.APIKEY);
    // // Make a simple API call to find the name of your inbox
    // const result = await mailosaur.servers.list();
    // console.log(`Inbox name is ${result.items[0].name}`);

    // List the most recent messages

const mailosaur = new MailosaurClient(process.env.APIKEY);
const result = await mailosaur.messages.list(process.env.SERVERID);

// Get the most recent message (the first one in the list)
const latestMessage = result.items[0];

// Get the full message object
const message = await mailosaur.messages.getById(latestMessage.id);
console.log(message)
console.log(message.html.body);
}


async function mail2(){
    const mailosaur = new MailosaurClient("2uoslzLjxwe42h6phdvln4AqmeA4tPA8");
    const result = await mailosaur.messages.get("s2jipchk",{
        sentTo: 'like-cast@s2jipchk.mailosaur.net'
    });

    // Get the most recent message (the first one in the list)
    // const latestMessage = result.items[0];

    // Get the full message object
    // const message = await mailosaur.messages.getById(latestMessage.id);
    // console.log(message)
    // console.log(message.html.body);
    
    console.log(result.html.codes.length)
    console.log(result.html.codes[0].value)
}
mail2()