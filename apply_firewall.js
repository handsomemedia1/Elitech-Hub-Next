const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

const slug = 'the-1m-firewall-vs-a-tired-employee';
const post = data.find(p => p.slug === slug);

function formatEditorial(author, pubDate) {
  const pDate = new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const uDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
<div class="editorial-attribution" style="font-size: 0.9em; color: #888; margin-bottom: 2rem; padding: 1rem; background: rgba(255,255,255,0.05); border-left: 3px solid #06b6d4; border-radius: 4px;">
  <p style="margin: 0 0 0.25rem 0"><strong>Written by:</strong> ${author}</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Edited by:</strong> Elijah Adeyeye, Founder, Elitech Hub</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Originally published:</strong> ${pDate}</p>
  <p style="margin: 0"><strong>Last updated:</strong> ${uDate}</p>
</div>
`;
}

let newContent = post.content;

if(!newContent.includes('editorial-attribution')) {
   newContent = formatEditorial(post.author, post.published_at) + newContent;
}

const cta = `<p style="margin-top: 2rem; padding: 1.5rem; background: rgba(6, 182, 212, 0.1); border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.3);"><em>Want to strengthen your team's cybersecurity awareness and reduce human error? Explore Elitech Hub's <a href="/services/corporate-training" style="color: #06b6d4; font-weight: bold; text-decoration: underline;">Corporate Cybersecurity Training</a>.</em></p>`;

if (!newContent.includes('Corporate Cybersecurity Training')) {
  newContent = newContent + cta;
}

async function run() {
  const res = await fetch(`${url}/rest/v1/blog_posts?id=eq.${post.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ content: newContent, updated_at: new Date().toISOString() })
  });
  console.log(`Updated firewall article: ${res.status}`);
}
run().catch(console.error);
