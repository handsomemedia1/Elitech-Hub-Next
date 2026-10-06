const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const q = `
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reviewed_by text;
  `;
  const res = await fetch(`${url}/rest/v1/`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ query: q })
  });
  // Wait, Supabase REST API doesn't support raw SQL like this directly unless using RPC.
  console.log("Supabase REST API cannot execute DDL.");
}
run().catch(console.error);
