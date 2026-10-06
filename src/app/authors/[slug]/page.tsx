import { getSupabaseServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: writer } = await supabase
    .from("writers")
    .select("display_name, professional_title, bio, avatar_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "approved")
    .single();

  if (!writer) return { title: "Author Not Found | Elitech Hub" };

  const title = `${writer.display_name} — ${writer.professional_title || "Writer"} at Elitech Hub`;
  const description = writer.bio || `Read articles and insights by ${writer.display_name}, a writer at Elitech Hub.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.elitechub.com/authors/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.elitechub.com/authors/${slug}`,
      siteName: "Elitech Hub",
      images: writer.avatar_url ? [{ url: writer.avatar_url, width: 800, height: 600, alt: writer.display_name }] : [],
      type: "profile",
    },
    twitter: { card: "summary", title, description, images: writer.avatar_url ? [writer.avatar_url] : [] },
    robots: { index: true, follow: true },
  };
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: writer } = await supabase
    .from("writers")
    .select("id, display_name, name, professional_title, bio, full_bio, avatar_url, expertise, location, linkedin_url, portfolio_url, website_url, posts_count, total_views, level, badges, slug, is_public, status")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "approved")
    .single();

  if (!writer) notFound();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, published_at, thumbnail, views")
    .eq("writer_id", writer.id)
    .eq("published", true)
    .order("published_at", { ascending: false });

  const publishedCount = posts?.length || 0;
  const canonicalUrl = `https://www.elitechub.com/authors/${slug}`;

  const elitechHubOrg = {
    "@type": "Organization",
    name: "Elitech Hub",
    url: "https://www.elitechub.com",
  };

  const personSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: writer.display_name || writer.name,
      jobTitle: writer.professional_title || "Writer",
      worksFor: elitechHubOrg,
      affiliation: elitechHubOrg,
      url: canonicalUrl,
      ...(writer.avatar_url && { image: writer.avatar_url }),
      ...(writer.full_bio || writer.bio ? { description: writer.full_bio || writer.bio } : {}),
      ...(writer.location && { homeLocation: { "@type": "Place", name: writer.location } }),
      ...(writer.expertise?.length > 0 && { knowsAbout: writer.expertise }),
      sameAs: [writer.linkedin_url, writer.portfolio_url, writer.website_url].filter(Boolean),
    },
  };

  if (posts && posts.length > 0) {
    (personSchema.mainEntity as Record<string, unknown>)["author"] = posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.elitechub.com/blog/${post.slug}`,
      name: post.title,
    }));
  }

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6">
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/writers" className="hover:text-white transition">Writers</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{writer.display_name}</span>
        </nav>

        <div className="bg-[#111317] border border-gray-800 rounded-2xl p-8 mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 shrink-0 bg-gray-900">
            {writer.avatar_url ? (
              <img src={writer.avatar_url} alt={writer.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                {writer.display_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{writer.display_name}</h1>
            <p className="text-[#C3151C] font-semibold mb-1">{writer.professional_title || "Writer"} at Elitech Hub</p>
            {writer.location && <p className="text-gray-500 text-sm mb-4">📍 {writer.location}</p>}
            {writer.level && writer.level !== "Newcomer" && (
              <span className="inline-block text-xs font-semibold bg-yellow-900/40 text-yellow-400 border border-yellow-800 px-3 py-1 rounded-full mb-4">
                {writer.level}
              </span>
            )}
            <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
              {writer.full_bio || writer.bio || `${writer.display_name} is a writer at Elitech Hub covering cybersecurity and technology.`}
            </p>
            <div className="flex gap-6 justify-center md:justify-start mb-6 text-sm text-gray-400">
              <span><strong className="text-white">{publishedCount}</strong> {publishedCount === 1 ? "Article" : "Articles"}</span>
              {writer.total_views > 0 && (
                <span><strong className="text-white">{writer.total_views.toLocaleString()}</strong> Views</span>
              )}
            </div>
            {writer.expertise && writer.expertise.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {writer.expertise.map((skill: string) => (
                    <span key={skill} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-700">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              {writer.linkedin_url && <a href={writer.linkedin_url} target="_blank" rel="noopener noreferrer me" className="text-gray-400 hover:text-white transition text-sm font-medium">LinkedIn ↗</a>}
              {writer.portfolio_url && <a href={writer.portfolio_url} target="_blank" rel="noopener noreferrer me" className="text-gray-400 hover:text-white transition text-sm font-medium">Portfolio ↗</a>}
              {writer.website_url && <a href={writer.website_url} target="_blank" rel="noopener noreferrer me" className="text-gray-400 hover:text-white transition text-sm font-medium">Website ↗</a>}
            </div>
            {writer.badges && writer.badges.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Achievements</h4>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {writer.badges.map((badge: string) => (
                    <span key={badge} className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full">🏆 {badge}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Articles by {writer.display_name}
            <span className="ml-3 text-base font-normal text-gray-400">({publishedCount})</span>
          </h2>
          {publishedCount > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {posts?.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="bg-[#111317] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition flex flex-col group">
                  {post.thumbnail && (
                    <div className="h-44 overflow-hidden">
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-[#C3151C] transition">{post.title}</h3>
                    {post.excerpt && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>}
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      {post.views > 0 && <span>{post.views.toLocaleString()} views</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">No published articles yet.</p>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/writers" className="text-gray-500 hover:text-white transition text-sm">← View all Elitech Hub Writers</Link>
        </div>
      </div>
    </PageLayout>
  );
}
