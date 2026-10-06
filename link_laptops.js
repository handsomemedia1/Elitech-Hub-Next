const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));
const slug = 'what-laptop-do-i-need-to-learn-cybersecurity';
const post = data.find(p => p.slug === slug);

let content = post.content;

// Add links at the bottom or inside relevant sections.
// I'll add a "Related Guides" section at the end if not present.
const linksBlock = `
<div style="margin-top: 3rem; padding: 2rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
  <h3>Recommended Laptop Guides by Budget</h3>
  <p>Now that you know what specifications to look for, check out our specific laptop recommendations based on your budget:</p>
  <ul>
    <li><a href="/blog/best-laptops-for-cybersecurity-under-300-000" style="color: #06b6d4; text-decoration: underline;">Best Laptops for Cybersecurity Under ₦300,000</a> (Best for students on a strict budget)</li>
    <li><a href="/blog/best-cybersecurity-laptops-in-nigeria-2026-guide" style="color: #06b6d4; text-decoration: underline;">Best Overall Cybersecurity Laptops in Nigeria</a> (Mid-range and widely available)</li>
    <li><a href="/blog/best-premium-laptops-for-learning-cybersecurity-in-2026" style="color: #06b6d4; text-decoration: underline;">Best Premium Laptops for Cybersecurity</a> (For advanced professionals and heavy VM usage)</li>
  </ul>
</div>
`;

if (!content.includes('Recommended Laptop Guides by Budget')) {
  // Insert before the last paragraph or CTA
  const insertIndex = content.lastIndexOf('<h2>');
  if (insertIndex > -1) {
    content = content.slice(0, insertIndex) + linksBlock + content.slice(insertIndex);
  } else {
    content += linksBlock;
  }
}

async function run() {
  const res = await fetch(`${url}/rest/v1/blog_posts?id=eq.${post.id}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ content })
  });
  console.log(`Updated laptop pillar links: ${res.status}`);
}
run().catch(console.error);
