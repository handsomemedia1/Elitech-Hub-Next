import { MetadataRoute } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase';

// All routes with their priority and change frequency
// Higher priority = Google crawls more often
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.elitechub.com';
  // Stable baseline modification timestamp for static landing, programme, and service routes
  const STATIC_LAST_MODIFIED = '2026-10-14T12:00:00.000Z';

  function formatSitemapDate(dateStr) {
    if (!dateStr) return STATIC_LAST_MODIFIED;
    try {
      const d = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? STATIC_LAST_MODIFIED : parsed.toISOString();
    } catch (e) {
      return STATIC_LAST_MODIFIED;
    }
  }
  
  let blogPosts = null;
  let researchPapers = null;
  let caseStudies = null;
  let labEntries = null;
  let laptops = null;

  try {
    const supabase = getSupabaseServerClient();
    
    // Fetch dynamic blog posts
    const { data: bPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('published', true);
    blogPosts = bPosts;
      
    // Fetch dynamic research papers (only published)
    const { data: rPapers } = await supabase
      .from('research')
      .select('slug, updated_at, created_at')
      .or('published.eq.true,publication_status.eq.published');
    researchPapers = rPapers;

    // Fetch dynamic case studies
    const { data: cStudies } = await supabase
      .from('web_case_studies')
      .select('slug, created_at')
      .eq('published', true);
    caseStudies = cStudies;
    // Fetch published labs
    const { data: lData } = await supabase
      .from('labs')
      .select('slug, updated_at, published_at')
      .eq('status', 'published');
    labEntries = lData;

    // Fetch published laptops
    const { data: laptopData } = await supabase
      .from('laptops')
      .select('slug, updated_at')
      .eq('published', true)
      .eq('archived', false);
    laptops = laptopData;

  } catch (error) {
    console.error('Failed to fetch dynamic routes for sitemap:', error);
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/programs/cybersecurity-bootcamp`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/programs/professional`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/programs/corporate-training`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apply`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/web-development`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/ai-chatbots`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/penetration-testing`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/custom-scripts`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/ai-training`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/get-involved`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/lab`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/security-check`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/founder`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/advisors`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/writers`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consultation`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/coaching`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research/membership`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/research/membership/apply`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/research/behavioral-cybersecurity`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research-paper`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/researcher-guidelines`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/volunteer`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Slugs that are permanently redirected (308) in next.config.ts must be excluded
  // to avoid Google Search Console "Submitted URL has redirect" indexing errors.
  const REDIRECTED_BLOG_SLUGS = new Set([
    'step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x',
  ]);

  if (blogPosts) {
    const blogUrls: MetadataRoute.Sitemap = blogPosts
      .filter((post) => !REDIRECTED_BLOG_SLUGS.has(post.slug))
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: formatSitemapDate(post.updated_at || post.published_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    routes.push(...blogUrls);
  }

  // Add /laptops catalog explicitly
  routes.push({
    url: `${baseUrl}/laptops`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  if (laptops) {
    const laptopUrls: MetadataRoute.Sitemap = (laptops as any[]).map((laptop) => ({
      url: `${baseUrl}/laptops/${laptop.slug}`,
      lastModified: formatSitemapDate(laptop.updated_at),
      changeFrequency: 'daily',
      priority: 0.85,
    }));
    routes.push(...laptopUrls);
  }

  if (researchPapers) {
    const researchUrls: MetadataRoute.Sitemap = researchPapers.map((paper) => ({
      url: `${baseUrl}/research/${paper.slug}`,
      lastModified: formatSitemapDate(paper.updated_at || paper.created_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
    routes.push(...researchUrls);
  }

  // Add static portfolio routes explicitly
  routes.push(
    { url: `${baseUrl}/portfolio/cyberoutreach-agent`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/portfolio/elitech-admin-bot`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/portfolio/rusty-threads-bot`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 }
  );

  if (caseStudies) {
    const caseStudyUrls: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
      url: `${baseUrl}/portfolio/${cs.slug}`,
      lastModified: formatSitemapDate(cs.created_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
    routes.push(...caseStudyUrls);
  }

  if (labEntries) {
    const labUrls: MetadataRoute.Sitemap = labEntries.map((lab) => ({
      url: `${baseUrl}/lab/${lab.slug}`,
      lastModified: formatSitemapDate(lab.updated_at || lab.published_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    routes.push(...labUrls);
  }

  try {
    const supabase = getSupabaseServerClient();
    
    // Add individual advisor profile pages (dynamic slugs from DB)
    const { data: advisors } = await supabase.from('advisors').select('slug, updated_at').eq('status', 'active');
    if (advisors) {
      routes.push(...advisors.map(a => ({
        url: `${baseUrl}/advisors/${a.slug}`,
        lastModified: formatSitemapDate(a.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7
      })));
    }

    // Add writers to sitemap (consistent rule: approved + is_public + slug IS NOT NULL)
    const { data: writers } = await supabase
      .from('writers')
      .select('slug, updated_at')
      .eq('status', 'approved')
      .eq('is_public', true)
      .not('slug', 'is', null);
      
    if (writers) {
      routes.push(...writers.map(w => ({
        url: `${baseUrl}/authors/${w.slug}`,
        lastModified: formatSitemapDate(w.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.75
      })));
    }

    // Add Resources
    const { data: resources } = await supabase.from('resources').select('slug, updated_at').eq('status', 'published');
    if (resources) {
      routes.push(...resources.map(r => ({
        url: `${baseUrl}/resources/${r.slug}`,
        lastModified: formatSitemapDate(r.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7
      })));
    }

  } catch (e) {
    console.error('Failed to add ecosystem routes to sitemap', e);
  }

  return routes;
}
