const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));
const slugs = [
  'what-cybersecurity-means-and-why-it-is-important-mniuol60',
  'bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe',
  'step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x'
];
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkExcerpts() {
  const res = await fetch(`${url}/rest/v1/blog_posts?slug=in.(${slugs.map(s=>`"${s}"`).join(',')})&select=slug,excerpt`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const dbData = await res.json();
  console.log(dbData);
}
checkExcerpts().catch(console.error);
