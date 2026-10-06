import { getSupabaseServerClient } from "@/lib/supabase";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writers | Elitech Hub",
  description: "Meet the writers and authors contributing to Elitech Hub — cybersecurity experts, researchers, and technology professionals sharing their knowledge.",
  alternates: { canonical: "https://www.elitechub.com/writers" },
  openGraph: {
    title: "Writers | Elitech Hub",
    description: "Meet the writers and authors contributing to Elitech Hub.",
    url: "https://www.elitechub.com/writers",
    siteName: "Elitech Hub",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function WritersIndexPage() {
  const supabase = getSupabaseServerClient();

  // Consistent publication rule: status=approved AND is_public=true AND slug NOT NULL
  const { data: writers, error } = await supabase
    .from("writers")
    .select("id, display_name, professional_title, bio, avatar_url, slug, expertise, posts_count, total_views, level")
    .eq("status", "approved")
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("posts_count", { ascending: false });

  const elitechHubOrg = {
    "@type": "Organization",
    name: "Elitech Hub",
    url: "https://www.elitechub.com",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Elitech Hub Writers",
    description: "Public directory of writers and authors at Elitech Hub.",
    url: "https://www.elitechub.com/writers",
    publisher: elitechHubOrg,
    hasPart: (writers || []).map(w => ({
      "@type": "Person",
      name: w.display_name,
      jobTitle: w.professional_title || "Writer",
      worksFor: elitechHubOrg,
      url: `https://www.elitechub.com/authors/${w.slug}`,
      ...(w.avatar_url && { image: w.avatar_url }),
    })),
  };

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ paddingTop: "120px", paddingBottom: "4rem", background: "linear-gradient(to bottom, var(--color-bg-base), var(--color-bg-main))" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem" }}>
            <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(195, 21, 28, 0.1)", color: "var(--color-accent)", borderRadius: "50px", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem" }}>
              Our Team
            </div>
            <h1 style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>
              Elitech Hub <span className="text-gradient-primary">Writers</span>
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Meet the cybersecurity experts, researchers, and technology professionals contributing knowledge and insights to Elitech Hub.
            </p>
          </div>

          {error && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
              <p>Unable to load writers at this time.</p>
            </div>
          )}

          {!error && (!writers || writers.length === 0) && (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-secondary)" }}>No writers published yet.</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
            {writers?.map((writer) => (
              <Link
                key={writer.id}
                href={`/authors/${writer.slug}`}
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="glass-panel"
                  style={{ padding: "2rem", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(195,21,28,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--color-border)", flexShrink: 0, background: "var(--color-bg-raised)" }}>
                      {writer.avatar_url ? (
                        <img src={writer.avatar_url} alt={writer.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-muted)" }}>
                          {writer.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {writer.display_name}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: 600 }}>
                        {writer.professional_title || "Writer"} at Elitech Hub
                      </p>
                    </div>
                  </div>

                  {writer.bio && (
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {writer.bio}
                    </p>
                  )}

                  {writer.expertise && writer.expertise.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                      {writer.expertise.slice(0, 3).map((tag: string) => (
                        <span key={tag} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", padding: "0.2rem 0.6rem", borderRadius: "50px" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {writer.posts_count || 0} {(writer.posts_count || 0) === 1 ? "article" : "articles"}
                      {writer.total_views > 0 && ` · ${writer.total_views.toLocaleString()} views`}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: 600 }}>
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
