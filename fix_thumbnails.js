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
  'best-laptop-for-virtualization-cybersecurity'
];

async function updateThumbnails() {
  const res = await fetch(`${url}/rest/v1/blog_posts?slug=in.(${slugs.map(s => `"${s}"`).join(',')})&select=id,slug,thumbnail`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  
  for (const post of data) {
    if (post.thumbnail && post.thumbnail.includes('elitechub.com')) {
      const newThumbnail = post.thumbnail.replace(/https:\/\/(www\.)?elitechub\.com/, '');
      const updateRes = await fetch(`${url}/rest/v1/blog_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ thumbnail: newThumbnail })
      });
      console.log(`Updated thumbnail in ${post.slug}: Status ${updateRes.status} to ${newThumbnail}`);
    } else {
      console.log(`No changes needed in ${post.slug} (${post.thumbnail})`);
    }
  }
}
updateThumbnails().catch(console.error);
