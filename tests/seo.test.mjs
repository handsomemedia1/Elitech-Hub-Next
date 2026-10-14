import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('Elitech Hub Technical & On-Page SEO Suite', () => {

  test('1. Canonical Domain Consistency', () => {
    // Layout and config must use canonical production domain
    const layoutPath = path.join(ROOT_DIR, 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    assert.match(layoutContent, /const SITE_URL = 'https:\/\/www\.elitechub\.com'/);
    assert.doesNotMatch(layoutContent, /const SITE_URL = 'https:\/\/elitechub\.com'/);
  });

  test('2. Robots Directives Security and Coverage', () => {
    const robotsPath = path.join(ROOT_DIR, 'src/app/robots.ts');
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');

    // Confirm critical private routes are disallowed
    const expectedDisallows = [
      '/api/',
      '/admin',
      '/before-cybersecurity/dashboard',
      '/before-cybersecurity/account',
      '/before-cybersecurity/report',
      '/before-cybersecurity/roadmap',
      '/before-cybersecurity/guide',
      '/before-cybersecurity/resources',
      '/before-cybersecurity/assessment',
      '/testimonials/collect/',
      '/certificate/'
    ];

    for (const route of expectedDisallows) {
      assert.ok(
        robotsContent.includes(`'${route}'`) || robotsContent.includes(`"${route}"`),
        `robots.ts must disallow private route: ${route}`
      );
    }

    // Confirm sitemap is set to canonical production domain
    assert.match(robotsContent, /https:\/\/www\.elitechub\.com\/sitemap\.xml/);
  });

  test('3. Sitemap Integrity and Exclusions', () => {
    const sitemapPath = path.join(ROOT_DIR, 'src/app/sitemap.ts');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Confirm static modified date is stable
    assert.match(sitemapContent, /STATIC_LAST_MODIFIED = '2026-10-14T12:00:00\.000Z'/);

    // Confirm redirected slug is explicitly filtered out from sitemap
    assert.ok(
      sitemapContent.includes('step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x'),
      'sitemap.ts must contain logic filtering out redirected blog slugs'
    );

    // Confirm key high-intent routes are included
    const highIntentRoutes = [
      'url: baseUrl',
      'url: `${baseUrl}/programs`',
      'url: `${baseUrl}/programs/cybersecurity-bootcamp`',
      'url: `${baseUrl}/programs/professional`',
      'url: `${baseUrl}/consultation`',
      'url: `${baseUrl}/coaching`',
      'url: `${baseUrl}/research/behavioral-cybersecurity`',
      'url: `${baseUrl}/research-paper`',
      'url: `${baseUrl}/researcher-guidelines`',
      'url: `${baseUrl}/security`',
      'url: `${baseUrl}/volunteer`'
    ];

    for (const r of highIntentRoutes) {
      assert.ok(
        sitemapContent.includes(r),
        `sitemap.ts must include route entry: ${r}`
      );
    }
  });

  test('4. Redirect Rules in next.config.ts', () => {
    const configPath = path.join(ROOT_DIR, 'next.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Confirm 301/308 permanent redirects exist
    assert.ok(configContent.includes("source: '/mentorship'"));
    assert.ok(configContent.includes("destination: '/coaching'"));
    assert.ok(configContent.includes("source: '/blog/step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x'"));
    assert.ok(configContent.includes("destination: '/blog/what-cybersecurity-means-and-why-it-is-important-mniuol60'"));

    // Deprecated Next 16 eslint config must be removed
    assert.doesNotMatch(configContent, /ignoreDuringBuilds/);
  });

  test('5. Social Preview Images Exist on Disk', () => {
    const appDir = path.join(ROOT_DIR, 'src/app');
    const checkedImages = new Set();

    function scanFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanFiles(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.matchAll(/https:\/\/www\.elitechub\.com\/(images\/[a-zA-Z0-9_\-\.]+\.(?:jpg|png|webp))/g);
          for (const m of matches) {
            checkedImages.add(m[1]);
          }
        }
      }
    }

    scanFiles(appDir);

    for (const imgRelPath of checkedImages) {
      const diskPath = path.join(ROOT_DIR, 'public', imgRelPath);
      assert.ok(
        fs.existsSync(diskPath),
        `Referenced image file does not exist on disk: ${imgRelPath} (checked at ${diskPath})`
      );
    }
  });

  test('6. Title Formatting - No Double Brand Suffixes in Page Titles', () => {
    const appDir = path.join(ROOT_DIR, 'src/app');
    const violations = [];

    function checkTitles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkTitles(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          if (entry.name === 'layout.tsx' && fullPath.includes('src/app/layout.tsx')) {
            continue; // layout.tsx defines the template
          }
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          let inSubObject = false;
          let braceDepth = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes('openGraph:') || line.includes('twitter:') || line.includes('jsonLd =') || line.includes('personSchema =')) {
              inSubObject = true;
              braceDepth = 0;
            }

            if (inSubObject) {
              const openBraces = (line.match(/{/g) || []).length;
              const closeBraces = (line.match(/}/g) || []).length;
              braceDepth += openBraces - closeBraces;
              if (braceDepth <= 0 && line.includes('}')) {
                inSubObject = false;
              }
              continue;
            }

            if (
              line.includes('title:') &&
              (line.includes('| Elitech Hub') || line.includes('- Elitech Hub')) &&
              !line.includes('template') &&
              !line.includes('default')
            ) {
              violations.push(`${fullPath}:${i + 1} -> ${line.trim()}`);
            }
          }
        }
      }
    }

    checkTitles(appDir);
    assert.deepEqual(violations, [], `Found pages with duplicate brand suffixes in metadata.title:\n${violations.join('\n')}`);
  });

  test('7. Truthful Claims and Contact Details in llms.txt and Metadata', () => {
    const llmsPath = path.join(ROOT_DIR, 'public/llms.txt');
    const llmsContent = fs.readFileSync(llmsPath, 'utf8');

    // Confirm no fabricated job placement claims
    assert.doesNotMatch(llmsContent, /100% job placement rate/i);

    // Confirm approved public contact emails
    assert.ok(llmsContent.includes('info@elitechub.com'));
    assert.ok(llmsContent.includes('elijah@elitechub.com'));

    // Confirm forbidden aliases are absent
    assert.doesNotMatch(llmsContent, /support@elitechub\.com/i);
    assert.doesNotMatch(llmsContent, /privacy@elitechub\.com/i);
    assert.doesNotMatch(llmsContent, /mentors@elitechub\.com/i);
  });

  test('8. Structured Schema Entity Consistency in Layout', () => {
    const layoutPath = path.join(ROOT_DIR, 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Verify Organization and EducationalOrganization schema
    assert.ok(layoutContent.includes("addressLocality: 'Ibadan'"));
    assert.ok(layoutContent.includes("addressRegion: 'Oyo State'"));
    assert.ok(layoutContent.includes("telephone: '+234 708 196 8062'"));
    assert.ok(layoutContent.includes("email: 'info@elitechub.com'"));
    assert.ok(layoutContent.includes("latitude: 7.3775"));
    assert.ok(layoutContent.includes("longitude: 3.9470"));
  });

});
