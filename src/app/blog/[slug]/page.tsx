import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import styles from "./post.module.css";
import { getSupabaseServerClient } from "@/lib/supabase";
import { Send, Briefcase, GraduationCap, MessageCircle, BookOpen } from "lucide-react";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { ViewTracker } from "@/components/ViewTracker";

export const revalidate = 60; // Revalidate every 60 seconds

  export async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = getSupabaseServerClient();
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, excerpt, thumbnail, category, author, published_at, created_at, updated_at, tags, writers(slug, is_public, status)")
      .eq("slug", slug)
      .eq("published", true)
      .single();
  
    if (!post) {
      return {
        title: "Post Not Found | Elitech Hub Blog",
      };
    }
  
    const writerData = post.writers as any;
    const isPublicWriter = writerData?.is_public === true && writerData?.status === "approved" && writerData?.slug;
    
    let authorCanonicalUrl: string | undefined;
    if (isPublicWriter) {
      authorCanonicalUrl = `https://www.elitechub.com/authors/${writerData.slug}`;
    } else if (post.author?.toLowerCase().includes("elijah")) {
      authorCanonicalUrl = `https://www.elitechub.com/founder`;
    }
  
    return {
      title: `${post.title} | Elitech Hub Blog`,
      description: post.excerpt || "Cybersecurity insights from Elitech Hub.",
      keywords: post.tags || ["cybersecurity", "tech", "elitech hub", "training", "Zero Trust"],
      openGraph: {
        title: post.title,
        description: post.excerpt || "",
        images: [
          {
            url: post.thumbnail || 'https://www.elitechub.com/images/og-default.jpg',
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        url: `https://www.elitechub.com/blog/${slug}`,
        type: "article",
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at || post.published_at || post.created_at,
        authors: authorCanonicalUrl ? [authorCanonicalUrl] : undefined,
        siteName: "Elitech Hub",
      },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "",
      images: [post.thumbnail || 'https://www.elitechub.com/images/og-default.jpg'],
    },
    alternates: { canonical: `https://www.elitechub.com/blog/${slug}` },
  };
}

function estimateReadTime(wordCount: number | null): string {
  if (!wordCount) return "5 min read";
  return `${Math.max(2, Math.ceil(wordCount / 200))} min read`;
}

function getAuthorInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown Date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime()) || date.getFullYear() === 1970) return "Unknown Date";
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, category, author, thumbnail, published_at, created_at, updated_at, views, tags, word_count, writer_id, writers(id, display_name, name, slug, avatar_url, professional_title, is_public, status, bio, full_bio)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post || error) {
    notFound();
  }

  // Also fetch related posts
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, thumbnail, category, published_at, word_count")
    .eq("published", true)
    .eq("category", post.category)
    .neq("slug", slug)
    .limit(3);

  // Determine canonical author URL — only link to public profile if writer is approved + public
  const writerData = post.writers as any;
  const isPublicWriter = writerData?.is_public === true && writerData?.status === "approved" && writerData?.slug;
  const authorCanonicalUrl = isPublicWriter
    ? `https://www.elitechub.com/authors/${writerData.slug}`
    : `https://www.elitechub.com/founder`; // fallback for founder/admin-authored posts

  const elitechHubOrg = {
    "@type": "Organization",
    name: "Elitech Hub",
    url: "https://www.elitechub.com",
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail ? [post.thumbnail] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      "@type": "Person",
      name: isPublicWriter ? writerData.display_name : post.author,
      url: authorCanonicalUrl,
      ...(isPublicWriter && writerData.avatar_url ? { image: writerData.avatar_url } : {}),
      worksFor: elitechHubOrg,
    },
    publisher: {
      "@type": "Organization",
      name: "Elitech Hub",
      url: "https://www.elitechub.com",
      logo: { "@type": "ImageObject", url: "https://www.elitechub.com/images/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.elitechub.com/blog/${slug}` },
    keywords: post.tags?.join(", "),
  };

  return (
    <PageLayout>
      <ViewTracker postId={post.id} writerId={post.writer_id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* ===== ARTICLE HERO ===== */}
      <section className={styles.articleHero}>
        {post.thumbnail && (
          <div className={styles.heroImageWrapper}>
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
              priority
              className={styles.heroImage}
            />
            <div className={styles.heroImageOverlay} />
          </div>
        )}
        <div className={styles.articleHeroInner}>
          <Link href="/blog" className={styles.backLink}>
            <i className="fas fa-arrow-left" /> Back to Blog
          </Link>
          <div className={styles.articleMeta}>
            <span className={styles.categoryTag} style={{ background: "#c3151c" }}>{post.category}</span>
            <span className={styles.readTime}><i className="far fa-clock" /> {estimateReadTime(post.word_count)}</span>
            <span className={styles.postDate}>
              Published {formatDate(post.published_at || post.created_at)}
              {post.updated_at && post.updated_at !== post.published_at && (
                <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>
                  (Updated {formatDate(post.updated_at)})
                </span>
              )}
            </span>
            {post.views > 0 && (
              <span className={styles.readTime}><i className="fas fa-eye" /> {post.views} views</span>
            )}
          </div>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          {post.excerpt && (
            <p className={styles.articleExcerpt}>{post.excerpt}</p>
          )}
          <div className={styles.articleAuthor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Written by
            </div>
            {writerData ? (
              isPublicWriter ? (
                <Link href={`/authors/${writerData.slug}`} className="flex items-start gap-4 hover:opacity-90 transition" style={{ textDecoration: 'none' }}>
                  <div className={styles.authorAvatar} style={{ overflow: 'hidden', width: '64px', height: '64px', flexShrink: 0, borderRadius: '50%' }}>
                    {writerData.avatar_url ? (
                      <img src={writerData.avatar_url} alt={writerData.display_name || writerData.name || post.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-raised)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {getAuthorInitials(writerData.display_name || writerData.name || post.author)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={styles.authorName} style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {writerData.display_name || writerData.name || post.author}
                    </div>
                    <div className={styles.authorRole} style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                      {writerData.professional_title || 'Writer'} at Elitech Hub
                    </div>
                    {(writerData.bio || writerData.full_bio) && (
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {writerData.bio || writerData.full_bio}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-4" style={{ textDecoration: 'none' }}>
                  <div className={styles.authorAvatar} style={{ overflow: 'hidden', width: '64px', height: '64px', flexShrink: 0, borderRadius: '50%' }}>
                    {writerData.avatar_url ? (
                      <img src={writerData.avatar_url} alt={writerData.display_name || writerData.name || post.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-raised)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {getAuthorInitials(writerData.display_name || writerData.name || post.author)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={styles.authorName} style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {writerData.display_name || writerData.name || post.author}
                    </div>
                    <div className={styles.authorRole} style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                      {writerData.professional_title || 'Writer'} at Elitech Hub
                    </div>
                    {(writerData.bio || writerData.full_bio) && (
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {writerData.bio || writerData.full_bio}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className={styles.authorAvatar} style={{ overflow: 'hidden', width: '56px', height: '56px', flexShrink: 0, borderRadius: '50%' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-raised)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {getAuthorInitials(post.author)}
                  </div>
                </div>
                <div>
                  <div className={styles.authorName} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {post.author}
                  </div>
                  <div className={styles.authorRole} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    {post.author?.toLowerCase().includes('elijah') ? 'Founder & Lead Instructor at Elitech Hub' : 'Writer at Elitech Hub'}
                  </div>
                </div>
              </div>
            )}
            {post.writer_id && post.status === "published" && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  Edited By
                </div>
                <div style={{ color: "white", fontWeight: 500, fontSize: "0.95rem" }}>
                  Elijah Adeyeye, Founder, Elitech Hub
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== ARTICLE CONTENT & SIDEBAR ===== */}
      <div className={styles.articleBody}>
        <article className={styles.articleInner}>
          {post.content ? (
            <div
              className={styles.richContent}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className={styles.articleLead}>{post.excerpt}</p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h4>Tags</h4>
              <div className={styles.tagsList}>
                {post.tags.slice(0, 6).map((tag: string, i: number) => (
                  <span key={i} className={styles.tagPill}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          <ArticleFeedback slug={slug} />

          {/* Share */}
          <div className={styles.shareSection}>
            <h4>Share this article</h4>
            <div className={styles.shareButtons}>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + `https://www.elitechub.com/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-whatsapp" /> WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.elitechub.com/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-twitter" /> X (Twitter)
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.elitechub.com/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-linkedin" /> LinkedIn
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.elitechub.com/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-facebook" /> Facebook
              </a>
              <a href="https://www.threads.net/@elitechhub" target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-threads" /> Threads
              </a>
              <a href="https://www.instagram.com/elitechhub" target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-instagram" /> Instagram
              </a>
              <a href="https://www.tiktok.com/@elitechhub" target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                <i className="fab fa-tiktok" /> TikTok
              </a>
            </div>
          </div>
        </article>

        {/* ===== STICKY SIDEBAR CTAs ===== */}
        <aside className={styles.sidebar}>
          <div className={styles.stickyWrapper}>
            <div className={styles.sidebarCard}>
              <Send className={styles.sidebarIcon} size={28} />
              <h3 className={styles.sidebarTitle}>Join Our Community</h3>
              <p className={styles.sidebarText}>Connect with thousands of cybersecurity enthusiasts and pros.</p>
              <a href="https://t.me/elitechhub" target="_blank" rel="noopener noreferrer" className={styles.sidebarLink}>
                Join Telegram →
              </a>
            </div>

            {/* Conditionally render Web Dev or Cyber CTA based on category */}
            {post.category?.toLowerCase().includes('development') || post.category?.toLowerCase().includes('web') || post.category?.toLowerCase().includes('ai') ? (
              <>
                <div className={styles.sidebarCard}>
                  <Briefcase className={styles.sidebarIcon} size={28} />
                  <h3 className={styles.sidebarTitle}>Custom Web Development</h3>
                  <p className={styles.sidebarText}>Build secure, high-performing websites and web applications.</p>
                  <Link href="/services/web-development" className={styles.sidebarLink}>
                    View Services →
                  </Link>
                </div>
                <div className={styles.sidebarCard}>
                  <BookOpen className={styles.sidebarIcon} size={28} />
                  <h3 className={styles.sidebarTitle}>AI & Chatbot Solutions</h3>
                  <p className={styles.sidebarText}>Automate your business with custom agentic AI applications.</p>
                  <Link href="/services/ai-chatbots" className={styles.sidebarLink}>
                    Learn More →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.sidebarCard}>
                  <GraduationCap className={styles.sidebarIcon} size={28} />
                  <h3 className={styles.sidebarTitle}>Master Cybersecurity</h3>
                  <p className={styles.sidebarText}>Enroll in our industry-recognized practical training programs.</p>
                  <Link href="/programs" className={styles.sidebarLink}>
                    Enroll Now →
                  </Link>
                </div>
                <div className={styles.sidebarCard}>
                  <BookOpen className={styles.sidebarIcon} size={28} />
                  <h3 className={styles.sidebarTitle}>Cybersecurity Research</h3>
                  <p className={styles.sidebarText}>Read our latest published papers and open-source threat intelligence.</p>
                  <Link href="/research" className={styles.sidebarLink}>
                    Read Research →
                  </Link>
                </div>
              </>
            )}

            <div className={styles.sidebarCard}>
              <Briefcase className={styles.sidebarIcon} size={28} />
              <h3 className={styles.sidebarTitle}>Elitech Portfolio</h3>
              <p className={styles.sidebarText}>See our success stories, corporate training, and VAPT services.</p>
              <Link href="/portfolio" className={styles.sidebarLink}>
                View Portfolio →
              </Link>
            </div>

            <div className={styles.sidebarCard}>
              <MessageCircle className={styles.sidebarIcon} size={28} />
              <h3 className={styles.sidebarTitle}>Need Expert Advice?</h3>
              <p className={styles.sidebarText}>Talk to our team about securing your business infrastructure.</p>
              <Link href="/contact" className={styles.sidebarLink}>
                Book Consultation →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== RELATED POSTS ===== */}
      {related && related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedTitle}>Related Articles</h2>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className={styles.relatedCard}>
                  {r.thumbnail && (
                    <div className={styles.relatedCardImage}>
                      <Image src={r.thumbnail} alt={r.title} fill style={{ objectFit: "cover" }} sizes="350px" />
                    </div>
                  )}
                  <div className={styles.relatedCardBody}>
                    <span className={styles.relatedCategory}>{r.category}</span>
                    <h3>{r.title}</h3>
                    <span className={styles.relatedDate}>{formatDate(r.published_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className={styles.ctaSection}>
        <h2>Ready to start your cybersecurity journey?</h2>
        <p>Join 300+ students who have already transformed their careers with Elitech Hub.</p>
        <Link href="/apply" className="btn btn-primary">Apply Now → </Link>
      </section>
    </PageLayout>
  );
}


