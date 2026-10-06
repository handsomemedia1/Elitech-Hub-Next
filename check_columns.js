const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkColumns() {
  const res = await fetch(`${url}/rest/v1/writer_productivity_settings?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  if (res.ok) {
    const data = await res.json();
    console.log("writer_productivity_settings data:");
    console.log(data);
  }
}
checkColumns().catch(console.error);
