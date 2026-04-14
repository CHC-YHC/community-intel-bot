const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Upsert user by phone — creates if new, updates if exists
async function saveUser(phone, fields = {}) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { phone, ...fields, updated_at: new Date().toISOString() },
      { onConflict: 'phone' }
    )
    .select()
    .single();

  if (error) throw new Error(`saveUser failed: ${error.message}`);
  return data;
}

// Get user by phone
async function getUser(phone) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`getUser failed: ${error.message}`);
  return data; // null if not found
}

// Save a single interaction (role = 'user' or 'assistant')
async function saveInteraction(phone, role, content) {
  const { error } = await supabase
    .from('interactions')
    .insert({ phone, role, content });

  if (error) throw new Error(`saveInteraction failed: ${error.message}`);
}

// Fix 3: Get recent conversation history (limited to 10)
async function getRecentHistory(phone, limit = 10) {
  const { data, error } = await supabase
    .from('interactions')
    .select('role, content')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getRecentHistory failed: ${error.message}`);
  return (data || []).reverse(); // reverse to chronological order
}

// Fix 4: Check daily message limit
async function checkDailyLimit(phone, maxPerDay = 50) {
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)
    .eq('role', 'user')
    .gte('created_at', today + 'T00:00:00Z');

  if (error) throw new Error(`checkDailyLimit failed: ${error.message}`);
  return (count || 0) < maxPerDay;
}

module.exports = { supabase, saveUser, getUser, saveInteraction, getRecentHistory, checkDailyLimit };
