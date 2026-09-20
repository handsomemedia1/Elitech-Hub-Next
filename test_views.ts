import * as fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});
import { createServiceClient } from './src/lib/supabase-server';
async function run() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('article_views').select('*').limit(1);
  console.log('article_views:', error ? error.message : 'exists');
}
run();
