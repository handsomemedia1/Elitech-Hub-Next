const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchAllBlogs() {
  const res = await fetch(`${url}/rest/v1/blog_posts?select=id,title,slug,author,published,published_at,updated_at,category,tags,word_count,content`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  fs.writeFileSync('all_blogs_dump.json', JSON.stringify(data, null, 2));
  console.log(`Fetched ${data.length} blogs.`);
}
fetchAllBlogs().catch(console.error);
