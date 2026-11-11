import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { ArrowRight, Building2, Globe, LinkedinLogo } from '@/components/icons';
import { ADVISORS } from '@/data/advisors';
import styles from './advisors.module.css';

const SITE = 'https://www.elitechub.com';

export const metadata: Metadata = {
  title: 'Our Advisors',
  description:
    'Meet the academic and industry advisors guiding Elitech Hub: experts in psychometrics, machine learning, digital transformation and natural resource management.',
  keywords: 'Elitech Hub advisors, cybersecurity advisory board, academic advisors Nigeria, cybersecurity mentors',
  alternates: { canonical: `${SITE}/advisors` },
  openGraph: {
    title: 'Our Advisors | Elitech Hub',
    description: 'Meet the academic and industry advisors guiding Elitech Hub.',
    url: `${SITE}/advisors`,
    images: [{ url: `${SITE}/images/og-default.jpg` }],
    type: 'website',
  },
};

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function AdvisorsPage() {
  // Each advisor is a Person linked to the organization, so search engines can
  // connect their names and profiles to Elitech Hub.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/advisors#page`,
    url: `${SITE}/advisors`,
    name: 'Elitech Hub Advisors',
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ADVISORS.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Person',
          '@id': `${SITE}/advisors/${a.slug}#person`,
          url: `${SITE}/advisors/${a.slug}`,
          name: a.plainName,
          description: a.summary,
          image: `${SITE}${a.image}`,
          jobTitle: a.jobTitle,
          hasCredential: { '@type': 'EducationalOccupationalCredential', name: a.credential },
          affiliation: [
            { '@type': 'Organization', name: a.organization },
            { '@id': `${SITE}/#organization` },
          ],
          knowsAbout: a.knowsAbout,
          sameAs: [a.linkedin, a.website].filter(Boolean),
        },
      })),
    },
  };

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <section className={styles.section}>
        <div className="container">
          <AnimateOnScroll direction="fade">
            <header className={styles.header}>
              <span className={styles.eyebrow}>Leadership &amp; Guidance</span>
              <h1 className={styles.title}>
                Our <span className="text-gradient-primary">Advisors</span>
              </h1>
              <p className={styles.lead}>
                Academic and industry experts who guide our curriculum, research and vision, so that what we teach
                stays rigorous and relevant.
              </p>
            </header>
          </AnimateOnScroll>

          <div className={styles.grid}>
            {ADVISORS.map((advisor, index) => (
              <AnimateOnScroll key={advisor.slug} direction="up" delay={index * 100}>
                <article id={advisor.slug} className={`glass-panel ${styles.card}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.avatar}>
                      <Image src={advisor.image} alt={advisor.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h2 className={styles.name}>
                        <Link href={`/advisors/${advisor.slug}`} className={styles.nameLink}>{advisor.name}</Link>
                      </h2>
                      <p className={styles.credential}>{advisor.credential}</p>
                    </div>
                  </div>

                  <p className={styles.org}>
                    <Building2 size={16} aria-hidden="true" /> {advisor.organization}
                  </p>
                  <p className={styles.bio}>{advisor.summary}</p>

                  <div className={styles.links}>
                    {advisor.linkedin && (
                      <a href={advisor.linkedin} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        <LinkedinLogo size={18} aria-hidden="true" /> LinkedIn
                      </a>
                    )}
                    {advisor.website && (
                      <a href={advisor.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        <Globe size={18} aria-hidden="true" /> Website
                      </a>
                    )}
                    <Link href={`/advisors/${advisor.slug}`} className={styles.profileLink}>
                      Read profile <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
