const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));
data.forEach((post, i) => {
  console.log(`${i+1}. ${post.title} (${post.slug}) [${post.category}] - ${post.word_count || '?'}`);
});
