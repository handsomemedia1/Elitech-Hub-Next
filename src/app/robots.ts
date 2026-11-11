import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // /api/research/download is the citation_pdf_url on research papers; Google
        // Scholar must be able to fetch it, so it is allowed despite /api/ below.
        allow: ['/', '/research/', '/lab/', '/authors/', '/writers/', '/api/research/download'],
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/dashboard/',
          '/thank-you',
          '/verify',
          '/researcher/',
          '/writer/',
          '/before-cybersecurity/dashboard',
          '/before-cybersecurity/account',
          '/before-cybersecurity/report',
          '/before-cybersecurity/roadmap',
          '/before-cybersecurity/guide',
          '/before-cybersecurity/resources',
          '/before-cybersecurity/assessment',
          '/before-cybersecurity/results',
          '/testimonials/collect/',
          '/certificate/',
        ],
      },
      // --- LLM / AI Crawlers: explicitly allow for indexing ---
      // This is what gets you into ChatGPT, Perplexity, Gemini etc.
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
      },
    ],
    sitemap: 'https://www.elitechub.com/sitemap.xml',
  };
}
