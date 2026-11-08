import { SITE_URL, getPublishedPosts, isoDate } from '@/lib/site-knowledge';

// RSS feed of the latest articles. Feed readers, news aggregators and several
// AI search crawlers look for one; previously /rss.xml returned 404.
export const revalidate = 3600;

function xml(text: string | null | undefined): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getPublishedPosts(50);

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const date = isoDate(p.published_at);
      return [
        '    <item>',
        `      <title>${xml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        date ? `      <pubDate>${new Date(date).toUTCString()}</pubDate>` : '',
        p.author ? `      <dc:creator>${xml(p.author)}</dc:creator>` : '',
        p.category ? `      <category>${xml(p.category)}</category>` : '',
        p.excerpt ? `      <description>${xml(p.excerpt)}</description>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Elitech Hub Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Cybersecurity, AI security and career insights from Elitech Hub, Nigeria.</description>
    <language>en-NG</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
