require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { handleMessage } = require('./bot');
const { sanitizeInput } = require('./security');
const { supabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

// --- Message dedup ---
const processedMessages = new Set();

function isDuplicate(messageId) {
  if (processedMessages.has(messageId)) return true;
  processedMessages.add(messageId);
  if (processedMessages.size > 1000) {
    const first = processedMessages.values().next().value;
    processedMessages.delete(first);
  }
  return false;
}

// Webhook verification
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
  res.sendStatus(200); // respond to Meta immediately

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  if (!message || message.type !== 'text') return;

  const messageId = message.id;
  if (isDuplicate(messageId)) return;

  const from = message.from;
  const name = change.contacts?.[0]?.profile?.name || '';
  const text = sanitizeInput(message.text?.body);

  if (!text) return;

  console.log(`Message from ${from}: ${text}`);

  handleMessage(from, text, name).catch(err =>
    console.error('Background processing error:', err.message)
  );
});

// --- Analytics endpoint ---
app.get('/analytics', async (req, res) => {
  const token = req.query.token;
  if (token !== process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.sendStatus(401);
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('onboarded', true);

    // Pain point distribution
    const { data: painPoints } = await supabase
      .from('users')
      .select('pain_point')
      .eq('onboarded', true);

    const painDist = {};
    (painPoints || []).forEach(u => {
      const pp = u.pain_point || 'Unknown';
      painDist[pp] = (painDist[pp] || 0) + 1;
    });

    // Role distribution
    const { data: roles } = await supabase
      .from('users')
      .select('role')
      .eq('onboarded', true);

    const roleDist = {};
    (roles || []).forEach(u => {
      const r = u.role || 'Unknown';
      roleDist[r] = (roleDist[r] || 0) + 1;
    });

    // Today's usage
    const { count: todayMessages } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today + 'T00:00:00Z');

    const { data: todayPhonesRaw } = await supabase
      .from('interactions')
      .select('phone')
      .gte('created_at', today + 'T00:00:00Z');

    const todayActiveUsers = new Set((todayPhonesRaw || []).map(r => r.phone)).size;

    // Recent questions (last 20 user messages)
    const { data: recentQuestions } = await supabase
      .from('interactions')
      .select('phone, content, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({
      total_users: totalUsers || 0,
      pain_point_distribution: painDist,
      role_distribution: roleDist,
      today_messages: todayMessages || 0,
      today_active_users: todayActiveUsers,
      recent_questions: recentQuestions || [],
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
