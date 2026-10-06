const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const slugs = [
  'why-every-business-needs-a-website',
  'how-much-does-a-business-website-cost-in-nigeria',
  'what-type-of-website-does-my-business-need',
  'what-laptop-do-i-need-to-learn-cybersecurity',
  'how-much-ram-do-i-need-for-cybersecurity',
  'best-laptop-for-virtualization-cybersecurity',
  'step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x'
];

async function verify() {
  const res = await fetch(`${url}/rest/v1/blog_posts?slug=in.(${slugs.map(s => `"${s}"`).join(',')})&select=slug,title,published,word_count,tags,updated_at`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  console.log("VERIFICATION RESULTS:");
  console.log(`Found ${data.length} of ${slugs.length} articles\n`);
  data.forEach(p => {
    console.log(`✅ ${p.slug}`);
    console.log(`   Title: ${p.title}`);
    console.log(`   Published: ${p.published} | Words: ${p.word_count} | Updated: ${p.updated_at}\n`);
  });
  const found = data.map(d => d.slug);
  slugs.filter(s => !found.includes(s)).forEach(s => console.log(`❌ MISSING: ${s}`));
}
verify().catch(console.error);
