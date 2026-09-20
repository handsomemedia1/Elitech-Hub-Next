import * as fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});
import { createServiceClient } from './src/lib/supabase-server';

async function checkSchema() {
  const supabase = createServiceClient();
  const { data: posts, error: errorPosts } = await supabase.from('blog_posts').select('*').limit(1);
  console.log("POSTS:", posts ? Object.keys(posts[0]) : errorPosts);

  const { data: writers, error: errorWriters } = await supabase.from('writers').select('*').limit(1);
  console.log("WRITERS:", writers ? (writers.length ? Object.keys(writers[0]) : []) : errorWriters);
  
  const { data: users, error: errorUsers } = await supabase.from('users').select('*').limit(1);
  console.log("USERS:", users ? Object.keys(users[0]) : errorUsers);
}
checkSchema();
