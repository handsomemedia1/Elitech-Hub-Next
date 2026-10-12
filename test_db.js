const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if(key && val) env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('writers').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest Writers:", JSON.stringify(data, null, 2));
  if (error) console.error(error);
}
check();
