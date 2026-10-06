const fs = require('fs');

let c = fs.readFileSync('src/app/sitemap.ts', 'utf8');

c = c.replace(/const baseUrl = 'https:\/\/elitechub\.com';/, "const baseUrl = 'https://www.elitechub.com';");

c = c.replace(/const now = new Date\(\)\.toISOString\(\);/, `const now = new Date().toISOString();

  function formatSitemapDate(dateStr) {
    if (!dateStr) return now;
    try {
      const d = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? now : parsed.toISOString();
    } catch (e) {
      return now;
    }
  }`);

c = c.replace(/lastModified: (.*?) \|\| (.*?) \|\| now,/g, 'lastModified: formatSitemapDate($1 || $2),');
c = c.replace(/lastModified: (.*?) \|\| now,/g, 'lastModified: formatSitemapDate($1),');

fs.writeFileSync('src/app/sitemap.ts', c);
console.log('sitemap.ts updated successfully');
