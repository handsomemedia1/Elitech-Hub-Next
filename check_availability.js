const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAvailabilityTable() {
  const res = await fetch(`${url}/rest/v1/writer_availability?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  if (res.ok) {
    console.log("writer_availability table EXISTS");
    console.log(await res.json());
  } else {
    console.log("writer_availability table DOES NOT EXIST or error:", res.status);
  }
}
checkAvailabilityTable().catch(console.error);
