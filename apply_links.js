const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

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

async function updateArticle(slug, replaceFn) {
  const post = data.find(p => p.slug === slug);
  if (!post) return console.error(`Post not found: ${slug}`);
  
  let newContent = post.content;
  if(!newContent.includes('editorial-attribution')) {
     newContent = formatEditorial(post.author, post.published_at) + newContent;
  }
  
  newContent = replaceFn(newContent);
  
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
  console.log(`Updated ${slug}: ${res.status}`);
}

async function run() {
  // 1. Bank Account Hacking
  await updateArticle('bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe', (content) => {
    return content.replace(
      '<p>Phishing works because it creates fear and urgency, pushing people to act quickly without thinking.</p>',
      '<p>Phishing works because it creates fear and urgency, pushing people to act quickly without thinking. To understand exactly what these fake messages look like and how to spot the red flags, read our complete guide on how to <a href="/blog/how-to-recognize-and-avoid-phishing-scams-in-nigeria-mo31j9uq" style="color: #06b6d4; text-decoration: underline;">recognize modern phishing attempts</a>.</p>'
    );
  });

  // 2. Canvas LMS
  await updateArticle('the-canvas-lms-breach-the-human-side-of-cybersecurity', (content) => {
    // The Canvas LMS article concludes with human error. Let's append to the last paragraph before headings.
    return content.replace(
      'Because in the end, security is only as strong as the people who use it.</p>',
      'Because in the end, security is only as strong as the people who use it. This highlights a universal truth in cybersecurity: no matter how much you spend on technology, <a href="/blog/the-1m-firewall-vs-a-tired-employee" style="color: #06b6d4; text-decoration: underline;">human error in cybersecurity</a> remains the most critical vulnerability to address.</p>'
    );
  });

  // 3. Agentic AI Attacks
  await updateArticle('agentic-ai-attacks-defenses-the-ai-arms-race-explained', (content) => {
    return content.replace(
      'Welcome to the age of agentic AI.',
      'Welcome to the age of agentic AI. As we shift into this era, the <a href="/blog/ai-is-now-both-the-hacker-and-the-guard" style="color: #06b6d4; text-decoration: underline;">dual-use nature of AI in security</a> means the same technology building autonomous defenses is also powering autonomous threats.'
    );
  });
}

run().catch(console.error);
