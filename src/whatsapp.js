const axios = require('axios');

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const MAX_LENGTH = 4000; // WhatsApp limit is ~4096, leave buffer

async function sendText(to, text) {
  const url = `${GRAPH_API}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Split long messages at paragraph boundaries
  const chunks = splitMessage(text, MAX_LENGTH);

  for (const chunk of chunks) {
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: chunk },
    }, { headers });
  }
}

function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to split at last paragraph break within limit
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen);
    // Fallback to last newline
    if (splitIdx < maxLen * 0.3) splitIdx = remaining.lastIndexOf('\n', maxLen);
    // Fallback to last space
    if (splitIdx < maxLen * 0.3) splitIdx = remaining.lastIndexOf(' ', maxLen);
    // Hard cut as last resort
    if (splitIdx < maxLen * 0.3) splitIdx = maxLen;

    chunks.push(remaining.slice(0, splitIdx).trimEnd());
    remaining = remaining.slice(splitIdx).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

module.exports = { sendText };
