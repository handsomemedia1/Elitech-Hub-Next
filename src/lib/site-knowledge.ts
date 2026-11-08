/**
 * Shared, server-only "knowledge" about Elitech Hub, generated from the live
 * database. Used by /llms-full.txt and /rss.xml so AI crawlers, feed readers
 * and search engines all see the same up-to-date list of content.
 */
import { getSupabaseServerClient } from '@/lib/supabase';
import { createServiceClient } from '@/lib/supabase-server';

export const SITE_URL = 'https://www.elitechub.com';

export type KnowledgePost = {
  title: string;
  slug: string;
  excerpt: string | null;
  author: string | null;
  category: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type KnowledgeLaptop = { name: string; slug: string; price: number | null };

function client() {
  return createServiceClient() || getSupabaseServerClient();
}

export async function getPublishedPosts(limit = 500): Promise<KnowledgePost[]> {
  try {
    const { data, error } = await client()
      .from('blog_posts')
      .select('title, slug, excerpt, author, category, published_at, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[site-knowledge] blog_posts:', error.message);
      return [];
    }
    return (data || []).filter((p) => p.slug && p.title) as KnowledgePost[];
  } catch (e) {
    console.error('[site-knowledge] blog_posts failed:', e);
    return [];
  }
}

export async function getPublishedLaptops(): Promise<KnowledgeLaptop[]> {
  try {
    const { data, error } = await client()
      .from('laptops')
      .select('name, slug, price')
      .eq('published', true)
      .eq('archived', false);
    if (error) {
      console.warn('[site-knowledge] laptops:', error.message);
      return [];
    }
    return (data || []).filter((l) => l.slug) as KnowledgeLaptop[];
  } catch (e) {
    console.error('[site-knowledge] laptops failed:', e);
    return [];
  }
}

/** Key public pages, with a one-line description each, for AI summaries. */
export const KEY_PAGES: Array<[string, string, string]> = [
  ['/programs', 'Training programmes', 'All cybersecurity training programmes, formats and pricing.'],
  ['/programs/professional', '16-Week Professional Cybersecurity Programme', 'Career programme with labs, mentorship and internship experience.'],
  ['/ai-training', 'AI-Powered Cybersecurity Programme', '6-week live virtual programme covering security fundamentals, Python, PowerShell, Linux and AI.'],
  ['/programs/corporate-training', 'Corporate training', 'Security awareness and custom training for organisations.'],
  ['/consultation', 'Career consultation', 'One-to-one cybersecurity career and transition consultation.'],
  ['/coaching', 'Coaching and mentorship', 'Personalised cybersecurity coaching.'],
  ['/services', 'Services', 'Penetration testing, secure web development, AI chatbots and custom scripts for businesses.'],
  ['/services/penetration-testing', 'Penetration testing', 'Web, network and mobile security assessments in Nigeria.'],
  ['/services/web-development', 'Web development', 'Secure, fast business websites and web applications.'],
  ['/services/ai-chatbots', 'AI chatbots', 'Custom AI chatbots and agentic AI applications.'],
  ['/services/custom-scripts', 'Custom scripts', 'Python, PowerShell and Bash automation for organisations.'],
  ['/laptops', 'Laptops for cybersecurity', 'Laptops recommended and sold for cybersecurity and programming students in Nigeria.'],
  ['/before-cybersecurity', 'Before Cybersecurity', 'Readiness assessment and interactive guide for people considering a cybersecurity career.'],
  ['/research', 'Research', 'Research papers and behavioural cybersecurity publications.'],
  ['/blog', 'Blog', 'Articles on cybersecurity, AI security, careers and Nigerian threat landscape.'],
  ['/faq', 'FAQ', 'Common questions about programmes, payments and careers.'],
  ['/founder', 'Founder', 'Elijah Adeyeye, founder and lead instructor.'],
  ['/writers', 'Writers', 'Contributing writers and their profiles.'],
  ['/about', 'About', 'Company background, mission and registration details.'],
  ['/contact', 'Contact', 'Email, phone/WhatsApp and contact form.'],
  ['/policies', 'Policies', 'Terms of service, privacy, cookie and refund policies.'],
];

export function isoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value.endsWith('Z') || value.includes('+') ? value : `${value}Z`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
