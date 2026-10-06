const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

let inventory = "";

data.forEach(post => {
  const content = post.content || "";
  
  // Extract links
  const links = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[2]);
  }
  
  // Extract images
  const images = (content.match(/<img/g) || []).length;
  
  // Extract headings
  const headings = (content.match(/<h[1-6]/g) || []).length;
  
  // Determine if it has a CTA (heuristic)
  const hasCTA = content.toLowerCase().includes('contact us') || 
                 content.toLowerCase().includes('apply now') ||
                 content.toLowerCase().includes('enroll') ||
                 content.toLowerCase().includes('call to action') ||
                 content.includes('CTA');

  inventory += `TITLE: ${post.title}\n`;
  inventory += `SLUG: ${post.slug}\n`;
  inventory += `AUTHOR: ${post.author}\n`;
  inventory += `CATEGORY: ${post.category}\n`;
  inventory += `PUBLISHED: ${post.published_at}\n`;
  inventory += `UPDATED: ${post.updated_at}\n`;
  inventory += `TAGS: ${JSON.stringify(post.tags)}\n`;
  inventory += `WORDS: ${post.word_count || content.split(/\s+/).length}\n`;
  inventory += `IMAGES: ${images}\n`;
  inventory += `HEADINGS: ${headings}\n`;
  inventory += `HAS_CTA: ${hasCTA}\n`;
  inventory += `LINKS: ${JSON.stringify(links)}\n`;
  inventory += `----------------------------------------\n\n`;
});

fs.writeFileSync('blog_inventory_summary.txt', inventory);
console.log('Saved to blog_inventory_summary.txt');
