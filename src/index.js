require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { handleMessage } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

// Webhook verification (Meta sends a GET request to verify your endpoint)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive incoming WhatsApp messages
app.post('/webhook', (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  if (message && message.type === 'text') {
    const from = message.from;
    const text = message.text?.body;
    console.log(`Message from ${from}: ${text}`);
    handleMessage(from, text).catch(err => console.error('Reply failed:', err.message));
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
