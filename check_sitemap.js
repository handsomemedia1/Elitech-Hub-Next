const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => reject(err));
  });
}

async function checkUrlStatus(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve('ERROR'));
    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
    req.end();
  });
}

async function run() {
  console.log('Fetching sitemap...');
  try {
    const { status, data } = await fetchUrl('https://www.elitechub.com/sitemap.xml');
    if (status !== 200) {
      console.error(`Sitemap failed to load with status ${status}`);
      return;
    }
    
    // Parse using regex
    const urls = [];
    const regex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      urls.push(match[1]);
    }
    
    console.log(`Found ${urls.length} URLs in sitemap.`);
    
    const problematicUrls = [];
    const healthyUrls = [];
    
    // Check in batches
    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      const results = await Promise.all(batch.map(async url => {
        // Replace elitechub.com with www.elitechub.com
        const wwwUrl = url.replace('https://elitechub.com', 'https://www.elitechub.com');
        const code = await checkUrlStatus(wwwUrl);
        return { url: wwwUrl, code };
      }));
      
      results.forEach(r => {
        if (r.code !== 200) {
          problematicUrls.push(r);
        } else {
          healthyUrls.push(r.url);
        }
      });
    }
    
    console.log('\n--- RESULTS ---');
    console.log(`Healthy URLs: ${healthyUrls.length}`);
    console.log(`Problematic URLs: ${problematicUrls.length}`);
    
    problematicUrls.forEach(p => {
      console.log(`[${p.code}] ${p.url}`);
    });
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

run();
