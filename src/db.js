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

// Get recent conversation history for context
async function getHistory(phone, limit = 20) {
  const { data, error } = await supabase
    .from('interactions')
    .select('role, content')
    .eq('phone', phone)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`getHistory failed: ${error.message}`);
  return data || [];
}

module.exports = { supabase, saveUser, getUser, saveInteraction, getHistory };
