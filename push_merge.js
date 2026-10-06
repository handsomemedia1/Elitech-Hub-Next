const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const a = JSON.parse(fs.readFileSync('article_a.json', 'utf8'));
const b = JSON.parse(fs.readFileSync('article_b.json', 'utf8'));
const combined = fs.readFileSync('merged_content.html', 'utf8');

async function doUpdate() {
  // 1. Update A
  const resA = await fetch(`${url}/rest/v1/blog_posts?id=eq.${a.id}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: combined, word_count: 1650, updated_at: new Date().toISOString() })
  });
  console.log('Update A status:', resA.status);

  // 2. Unpublish B
  const resB = await fetch(`${url}/rest/v1/blog_posts?id=eq.${b.id}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: false, updated_at: new Date().toISOString() })
  });
  console.log('Unpublish B status:', resB.status);
}

doUpdate().catch(console.error);
