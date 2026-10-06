const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));
const post = data.find(p => p.slug === 'how-to-recognize-and-avoid-phishing-scams-in-nigeria-mo31j9uq');
if(post) fs.writeFileSync('phishing_existing.html', post.content);
