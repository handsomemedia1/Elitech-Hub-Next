const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

function injectLink(content, injectionHtml) {
  if (content.includes(injectionHtml)) return content; // Avoid duplicate
  // Try to insert before the last <h2> (usually "Conclusion")
  const lastH2 = content.lastIndexOf('<h2');
  if (lastH2 > 0) {
    return content.slice(0, lastH2) + injectionHtml + '\n' + content.slice(lastH2);
  }
  // Fallback to appending
  return content + '\n' + injectionHtml;
}

const updates = [
  {
    file: 'supply-chain-and-third-party-fragility.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Real-World Case Study:</strong> To see exactly how these vulnerabilities play out on a global scale, read our breakdown of how the <a href="/blog/foxconn-cyberattack-disrupts-major-tech-supply-chains" style="color: #06b6d4; text-decoration: underline;">Foxconn cyberattack disrupted major tech supply chains</a>.</div>`
  },
  {
    file: 'foxconn-cyberattack-disrupts-major-tech-supply-chains.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Protecting Your Business:</strong> The Foxconn breach is a perfect example of why modern enterprises must look beyond their own walls. Learn how to secure your vendor network in our comprehensive guide to <a href="/blog/supply-chain-and-third-party-fragility" style="color: #06b6d4; text-decoration: underline;">Supply Chain and Third-Party Fragility</a>.</div>`
  },
  {
    file: 'beyond-firewalls-the-hidden-layers-of-modern-cyber-defense.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Real-World Threat:</strong> One of the most dangerous ways attackers bypass firewalls is by compromising the tools developers use. Learn how the <a href="/blog/shai-hulud-worm-a-hacked-package-threat" style="color: #06b6d4; text-decoration: underline;">Shai-Hulud Worm exploits hacked packages</a> to breach secure environments.</div>`
  },
  {
    file: 'shai-hulud-worm-a-hacked-package-threat.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Broader Strategy:</strong> Threats like the Shai-Hulud worm bypass traditional perimeter defenses entirely. To understand how to protect your organization from these modern tactics, read our guide on <a href="/blog/beyond-firewalls-the-hidden-layers-of-modern-cyber-defense" style="color: #06b6d4; text-decoration: underline;">the hidden layers of modern cyber defense</a>.</div>`
  },
  {
    file: 'how-fake-it-support-is-powering-modern-cyber-attacks.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Current Threat Alert (2026):</strong> Attackers are actively using fake IT support pop-ups to hijack devices. Read our full breakdown of <a href="/blog/clickfix-the-scam-hijacking-laptops-in-2026" style="color: #06b6d4; text-decoration: underline;">ClickFix: The Scam Hijacking Laptops in 2026</a> to see exactly how this attack unfolds.</div>`
  },
  {
    file: 'clickfix-the-scam-hijacking-laptops-in-2026.json',
    inject: `<div style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>The Bigger Picture:</strong> ClickFix is part of a massive shift toward exploiting human trust. Discover how attackers are weaponizing helpdesks in our deep-dive on <a href="/blog/how-fake-it-support-is-powering-modern-cyber-attacks" style="color: #06b6d4; text-decoration: underline;">How Fake IT Support Is Powering Modern Cyber Attacks</a>.</div>`
  }
];

async function applyUpdates() {
  for (const update of updates) {
    const postData = JSON.parse(fs.readFileSync(update.file, 'utf8'));
    let newContent = postData.content;
    
    // Add Editorial Block if missing
    if (!newContent.includes('editorial-attribution')) {
      newContent = formatEditorial(postData.author, postData.pub) + newContent;
    }
    
    // Add Contextual Link
    newContent = injectLink(newContent, update.inject);
    
    const patchRes = await fetch(`${url}/rest/v1/blog_posts?id=eq.${postData.id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ content: newContent, updated_at: new Date().toISOString() })
    });
    
    console.log(`Updated ${update.file.replace('.json', '')}: ${patchRes.status}`);
  }
}
applyUpdates().catch(console.error);
