const https = require('https');

https.get('https://www.elitechub.com/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const canonicalMatch = data.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i) || 
                           data.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"[^>]*>/i);
    console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'not found');
  });
}).on('error', err => console.error(err));
