const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));
const post = data.find(p => p.slug === 'the-1m-firewall-vs-a-tired-employee');
if(post) fs.writeFileSync('firewall.html', post.content);
