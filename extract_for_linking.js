const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

const slugs = [
  'bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe',
  'the-canvas-lms-breach-the-human-side-of-cybersecurity',
  'agentic-ai-attacks-defenses-the-ai-arms-race-explained'
];

slugs.forEach(slug => {
  const post = data.find(p => p.slug === slug);
  if(post) {
    fs.writeFileSync(`${slug}.html`, post.content);
    console.log(`Saved ${slug}.html`);
  }
});
