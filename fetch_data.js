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

async function getData() {
  // Get the full schema of blog_posts
  const bpRes = await fetch(`${url}/rest/v1/blog_posts?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const bp = await bpRes.json();
  
  // Get existing beginner article full content
  const begRes = await fetch(`${url}/rest/v1/blog_posts?slug=eq.step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x&select=id,slug,title,content,excerpt,category,author,tags,word_count,published_at`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const beg = await begRes.json();

  // Get all published laptop inventory 
  const lapRes = await fetch(`${url}/rest/v1/laptops?select=name,brand,model,slug,cpu,cpu_generation,ram_gb,storage_gb,storage_type,gpu,price,currency,condition,cybersecurity_suitability,use_cases,short_description,availability&eq.published=true`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const lap = await lapRes.json();

  if (bp.length > 0) console.log("BLOG_POST_COLUMNS:", Object.keys(bp[0]).join(', '));
  console.log("\nBEGINNER_ARTICLE:");
  console.log(JSON.stringify(beg, null, 2));
  console.log("\nLAPTOP_INVENTORY:");
  console.log(JSON.stringify(lap, null, 2));
}

getData().catch(console.error);
