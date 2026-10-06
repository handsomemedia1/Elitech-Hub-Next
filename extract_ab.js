const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

const articleA = data.find(p => p.slug === 'what-cybersecurity-means-and-why-it-is-important-mniuol60');
const articleB = data.find(p => p.slug === 'step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x');

fs.writeFileSync('article_a.json', JSON.stringify(articleA, null, 2));
fs.writeFileSync('article_b.json', JSON.stringify(articleB, null, 2));
