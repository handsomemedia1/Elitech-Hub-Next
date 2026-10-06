const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getData() {
  const lapRes = await fetch(`${url}/rest/v1/laptops?published=eq.true&select=name,brand,model,slug,cpu,cpu_generation,ram_gb,storage_gb,storage_type,price,currency,condition,cybersecurity_suitability,use_cases,short_description,availability`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const lap = await lapRes.json();
  console.log("LAPTOP_INVENTORY:");
  console.log(JSON.stringify(lap, null, 2));
}
getData().catch(console.error);
