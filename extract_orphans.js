const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

const slugs = [
  'foxconn-cyberattack-disrupts-major-tech-supply-chains',
  'supply-chain-and-third-party-fragility',
  'shai-hulud-worm-a-hacked-package-threat',
  'beyond-firewalls-the-hidden-layers-of-modern-cyber-defense',
  'clickfix-the-scam-hijacking-laptops-in-2026',
  'how-fake-it-support-is-powering-modern-cyber-attacks'
];

slugs.forEach(s => {
  const post = data.find(p => p.slug === s);
  if(post) {
    fs.writeFileSync(s + '.json', JSON.stringify({id: post.id, author: post.author, pub: post.published_at, content: post.content}));
    console.log(`Saved ${s}.json`);
  }
});
