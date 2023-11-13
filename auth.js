// Import necessary modules
const express = require("express"); 
const router = express.Router();

const { authenticate } = require("@google-cloud/local-auth"); // Import the authentication module
const { google } = require("googleapis"); // Import Google APIs
const path = require("path"); // Import path module for file paths

// Gmail API scopes required for authorization
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// Define the label name for vacation emails
const LABEL_NAME = "Vacation";

//routes
router.get("/api", async (req, res) => {
  try {
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, "credentials.json"),
      scopes: GMAIL_SCOPES,
    });
    // Create an instance of Gmail API
    const gmail = google.gmail({ version: "v1", auth });

    // Function to get unreplied messages from the inbox
    async function getUnrepliedMessages() {
        console.log('Function getUnrepliedMessages triggered');
        const gmail = google.gmail({ version: "v1", auth });
        const response = await gmail.users.messages.list({
          userId: "me",
          labelIds: ["INBOX"],
          q: '-in:chats -from:me -has:userlabels',
        });
        return response.data.messages || [];
    }

    // Function to add a label to the message
    async function addLabelToMessage(message, labelId) {
        const gmail = google.gmail({ version: 'v1', auth });
        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: {
            addLabelIds: [labelId],
            removeLabelIds: ['INBOX'],
          },
        });
    }

    // Function to create or retrieve the label ID for vacation emails
    async function createOrRetrieveLabelId() {
        console.log('Function createOrRetrieveLabelId triggered');
        const gmail = google.gmail({ version: "v1", auth });
        try {
          const response = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
              name: LABEL_NAME,
              labelListVisibility: "labelShow",
              messageListVisibility: "show",
            },
          });
          return response.data.id;
        } catch (error) {
          if (error.code === 409) {
            const response = await gmail.users.labels.list({
              userId: "me",
            });
            const label = response.data.labels.find(
              (label) => label.name === LABEL_NAME
            );
            return label.id;
          } else {
            throw error;
          }
        }
    }

    // Function to send an auto-reply to a message
    async function sendAutoReply(message) {
        console.log('Function sendAutoReply triggered');
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From'],
        });
        const subject = res.data.payload.headers.find(
          (header) => header.name === 'Subject'
        ).value;
        const from = res.data.payload.headers.find(
          (header) => header.name === 'From'
        ).value;
        const replyTo = from.match(/<(.*)>/)[1];
        const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
        const replyBody = `Hi,\nThank you for reaching out. I am currently out of the office.
        During this time, I will not be available to respond to emails. 
        I will attend to your message as soon as possible upon my return.
        Thank you for your understanding.
         \nBest Regards,
         Mukund Bajpai`;
        const rawMessage = [
          `From: me`,
          `To: ${replyTo}`,
          `Subject: ${replySubject}`,
          `In-Reply-To: ${message.id}`,
          `References: ${message.id}`,
          '',
          replyBody,
        ].join('\n');
        const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
          },
        });
    }

    // Main function for the interval and processing
    async function main() {
        const labelId = await createOrRetrieveLabelId();
        console.log(`Label created/retrieved with ID: ${labelId}`);
        setInterval(async () => {
          const messages = await getUnrepliedMessages();
          console.log(`Found ${messages.length} unreplied messages`);
    
          for (const message of messages) {
            await sendAutoReply(message);
            console.log(`Sent auto-reply to message with ID: ${message.id}`);
            await addLabelToMessage(message, labelId);
            console.log(`Added label to message with ID: ${message.id}`);
          }
        }, 
        // Random interval between 45 and 120 seconds
        Math.floor(Math.random() * (120000 - 45000)) + 45000);
    }

    main().catch(console.error);
    res.send("Server is running.");
  } 
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
