import { readFile } from 'fs/promises';
import path from 'path';
import {
  SITE_URL,
  KEY_PAGES,
  getPublishedPosts,
  getPublishedLaptops,
  isoDate,
} from '@/lib/site-knowledge';

// AI crawlers (ClaudeBot, GPTBot, PerplexityBot...) request /llms-full.txt and
// were getting a 404. This builds it from the hand-written /llms.txt summary
// plus a live index of every key page, article and laptop. Rebuilt hourly.
export const revalidate = 3600;

function oneLine(text: string | null | undefined): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export async function GET() {
  let summary = '';
  try {
    summary = await readFile(path.join(process.cwd(), 'public', 'llms.txt'), 'utf8');
  } catch {
    summary = '# Elitech Hub\n\nNigeria-based cybersecurity training, research and digital services company.';
  }

  const [posts, laptops] = await Promise.all([getPublishedPosts(), getPublishedLaptops()]);

  const lines: string[] = [summary.trim(), ''];

  lines.push('## Key Pages', '');
  for (const [href, title, desc] of KEY_PAGES) {
    lines.push(`- [${title}](${SITE_URL}${href}): ${desc}`);
  }

  if (posts.length) {
    lines.push('', `## Articles (${posts.length})`, '');
    for (const p of posts) {
      const date = isoDate(p.published_at)?.slice(0, 10);
      const meta = [p.author && `by ${oneLine(p.author)}`, date, p.category && oneLine(p.category)]
        .filter(Boolean)
        .join(' · ');
      lines.push(`- [${oneLine(p.title)}](${SITE_URL}/blog/${p.slug})${meta ? ` (${meta})` : ''}`);
      const excerpt = oneLine(p.excerpt);
      if (excerpt) lines.push(`  ${excerpt}`);
    }
  }

  if (laptops.length) {
    lines.push('', '## Laptops for Cybersecurity Students', '');
    for (const l of laptops) {
      const price = typeof l.price === 'number' ? ` (₦${l.price.toLocaleString('en-NG')})` : '';
      lines.push(`- [${oneLine(l.name)}](${SITE_URL}/laptops/${l.slug})${price}`);
    }
  }

  lines.push(
    '',
    '## Feeds',
    '',
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
    `- RSS (latest articles): ${SITE_URL}/rss.xml`,
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
