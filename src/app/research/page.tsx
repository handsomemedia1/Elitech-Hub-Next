import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import layoutStyles from '@/components/PageLayout.module.css';
import styles from './research.module.css';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Link from 'next/link';
import ResearchList from '@/components/ResearchList';

export const metadata: Metadata = {
  title: 'Cybersecurity Research & Publications | Elitech Hub Nigeria',
  description:
    'Elitech Hub publishes original cybersecurity research covering AI security, threat intelligence, malware analysis, and African cyber threats. View published papers, active projects, and open-source tools.',
  keywords: [
    'cybersecurity research Nigeria',
    'cybersecurity publications Nigeria',
    'AI security research Africa',
    'threat intelligence research Nigeria',
    'malware analysis Africa',
    'cybersecurity paper Nigeria',
    'open source security tools Nigeria',
    'blockchain security research',
    'African cybersecurity researchers',
    'Elitech Hub research',
  ],
  openGraph: {
    title: 'Cybersecurity Research & Publications | Elitech Hub Nigeria',
    description: 'Original cybersecurity research from Elitech Hub — AI security, threat intelligence, and African cyber threats.',
    url: 'https://elitechub.com/research',
    siteName: 'Elitech Hub',
    locale: 'en_NG',
    images: [{ url: 'https://elitechub.com/images/og-default.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: { canonical: 'https://elitechub.com/research' },
};


export default function ResearchPage() {
  const jsonLd = [
    // BreadcrumbList
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elitechub.com' },
        { '@type': 'ListItem', position: 2, name: 'Research', item: 'https://elitechub.com/research' },
      ],
    },
    // Published paper: Can AI Express Empathy?
    {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      name: 'Can AI Express Empathy?',
      headline: 'Can AI Express Empathy?',
      description: 'A research paper exploring the limits and possibilities of artificial empathy in AI systems, published in Springer Nature, May 2026.',
      datePublished: '2026-05-01',
      publisher: { '@type': 'Organization', name: 'Springer Nature' },
      author: { '@type': 'Organization', name: 'Elitech Hub Research Team', url: 'https://elitechub.com/research' },
      about: ['Artificial Intelligence', 'Empathy', 'Machine Learning', 'Cybersecurity Psychology'],
      url: 'https://elitechub.com/research',
    },
    // Project: PSEDS
    {
      '@context': 'https://schema.org',
      '@type': 'ResearchProject',
      name: 'PSEDS — Proactive Security and Early Detection System',
      description: 'AI-driven security system identifying advanced persistent threats using telemetry from African network infrastructure.',
      funding: { '@type': 'Grant', name: 'Elitech Hub Research Fund' },
      member: { '@type': 'Organization', name: 'Elitech Hub', url: 'https://elitechub.com' },
      about: ['Cybersecurity', 'Threat Detection', 'AI Security', 'APT'],
      url: 'https://elitechub.com/research',
    },
    // Organization as research entity
    {
      '@context': 'https://schema.org',
      '@type': 'ResearchOrganization',
      name: 'Elitech Hub',
      url: 'https://elitechub.com/research',
      description: 'Elitech Hub conducts community-driven cybersecurity research across threat intelligence, malware analysis, AI security, and African cyber threat landscapes.',
      foundingDate: '2023',
      address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
      knowsAbout: ['Cybersecurity', 'Threat Intelligence', 'Malware Analysis', 'AI Security', 'Blockchain Security'],
    },
  ];

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <AnimateOnScroll>
        <div className={layoutStyles.pageHero} style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(/assets/images/research-hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 1.5rem', borderRadius: '3rem', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.1em', color: 'white' }}>
            🔬 RESEARCH & PROJECTS
          </div>
          <h1 className={layoutStyles.pageTitle}>
            Innovation in <span className={layoutStyles.accentText}>Cybersecurity</span>
          </h1>
          <p className={layoutStyles.pageSubtitle}>
            Innovative systems, research, and publishable projects from our team.
          </p>

          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem 2rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <span style={{ color: '#6ee7b7', fontSize: '1.5rem' }}>🧪</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>Active</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Research Projects</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem 2rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <span style={{ color: '#c3151c', fontSize: '1.5rem' }}>💻</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>Open Source</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Contributions</div>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      <section className={layoutStyles.section}>
        <div className={styles.researchContainer}>
          <div style={{ marginTop: '2rem' }}>
            <ResearchList />
          </div>

          <AnimateOnScroll>
            <div className={styles.researchBanner}>
              <span className={styles.bannerDecor}>🔬</span>
              <h2 className={styles.researchBannerTitle}>Join Our Research Network</h2>
              <p className={styles.researchBannerText}>
                We collaborate with independent security researchers, academic institutions, and enterprise partners to push the boundaries of cybersecurity.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link href="/contact" className="premium-button">
                  Register as a Researcher
                </Link>
                <Link href="/researcher-guidelines" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  View Guidelines
                </Link>
              </div>
            </div>
          </AnimateOnScroll>

        </div>
      </section>
    </PageLayout>
  );
}
