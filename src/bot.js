const Anthropic = require('@anthropic-ai/sdk');
const { sendText } = require('./whatsapp');
const { saveUser, saveInteraction, getHistory } = require('./db');

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful AI assistant on WhatsApp.
You are friendly, concise, and professional.
Reply in the same language the user writes in.
Keep responses short — most people read on their phone.`;

async function handleMessage(from, text) {
  // Ensure user exists in DB
  await saveUser(from);

  // Save the user's message
  await saveInteraction(from, 'user', text);

  // Load conversation history for context
  const history = await getHistory(from);
  const messages = history.map(h => ({ role: h.role, content: h.content }));

  // Call Claude
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content[0].text;

  // Save assistant reply
  await saveInteraction(from, 'assistant', reply);

  // Send reply back via WhatsApp
  await sendText(from, reply);
}

module.exports = { handleMessage };
