const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const oldUrl = '/blog/step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x';
const newUrl = '/blog/what-cybersecurity-means-and-why-it-is-important-mniuol60';

async function fixLinks() {
  const res = await fetch(`${url}/rest/v1/blog_posts?select=id,slug,content`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  
  let updatedCount = 0;
  for (const post of data) {
    if (post.content && post.content.includes(oldUrl)) {
      const updatedContent = post.content.split(oldUrl).join(newUrl);
      const patchRes = await fetch(`${url}/rest/v1/blog_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ content: updatedContent })
      });
      console.log(`Updated links in: ${post.slug} (${patchRes.status})`);
      updatedCount++;
    }
  }
  console.log(`Total articles updated: ${updatedCount}`);
}
fixLinks().catch(console.error);
