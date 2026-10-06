const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const updates = [
  { slug: 'what-cybersecurity-means-and-why-it-is-important-mniuol60', newTitle: "What is Cybersecurity? A Complete Guide for Beginners" },
  { slug: 'bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe', newTitle: "How Bank Accounts Are Hacked in Nigeria (And How to Protect Yours)" },
  { slug: 'step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x', newTitle: "The Ultimate Cybersecurity Roadmap for Beginners (2026)" }
];

async function updateTitles() {
  for (const item of updates) {
    const res = await fetch(`${url}/rest/v1/blog_posts?slug=eq.${item.slug}`, {
      method: 'PATCH',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ title: item.newTitle })
    });
    console.log(`Updated title for ${item.slug}: ${res.status}`);
  }
}
updateTitles().catch(console.error);
