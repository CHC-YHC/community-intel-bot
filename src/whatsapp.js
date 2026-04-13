const axios = require('axios');

const GRAPH_API = 'https://graph.facebook.com/v21.0';

async function sendText(to, text) {
  const url = `${GRAPH_API}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

module.exports = { sendText };
