const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function audit() {
  const blogRes = await fetch(`${url}/rest/v1/blog_posts`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const blogs = await blogRes.json();

  const laptopsRes = await fetch(`${url}/rest/v1/laptops`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const laptops = await laptopsRes.json();

  console.log("=== BLOG POSTS ===");
  console.log(JSON.stringify(blogs.map(b => ({id: b.id, slug: b.slug, title: b.title, category: b.category, tags: b.tags, published: b.published})), null, 2));

  console.log("=== LAPTOPS ===");
  console.log(JSON.stringify(laptops.map(l => ({id: l.id, slug: l.slug, name: l.name, condition: l.condition, published: l.published})), null, 2));
}

audit().catch(err => console.error(err));
