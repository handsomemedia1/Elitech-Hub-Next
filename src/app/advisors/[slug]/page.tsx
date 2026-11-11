import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { Building2, ChevronLeft, Globe, GraduationCap, LinkedinLogo } from '@/components/icons';
import { ADVISORS, getAdvisor } from '@/data/advisors';
import styles from '../advisors.module.css';

const SITE = 'https://www.elitechub.com';

export const dynamicParams = false;

export function generateStaticParams() {
  return ADVISORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const advisor = getAdvisor(slug);
  if (!advisor) return { title: 'Advisor Not Found' };

  // Short enough for Google not to truncate; the job title is in the description.
  const title = `${advisor.name}, Advisor`;
  const url = `${SITE}/advisors/${slug}`;
  return {
    title,
    description: advisor.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Elitech Hub`,
      description: advisor.summary,
      url,
      type: 'profile',
      images: [{ url: `${SITE}${advisor.image}` }],
    },
  };
}

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default async function AdvisorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const advisor = getAdvisor(slug);
  if (!advisor) notFound();

  const url = `${SITE}/advisors/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: `${advisor.name} | Elitech Hub Advisor`,
        isPartOf: { '@id': `${SITE}/#website` },
        mainEntity: { '@id': `${url}#person` },
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: advisor.plainName,
        url,
        image: `${SITE}${advisor.image}`,
        jobTitle: advisor.jobTitle,
        description: advisor.summary,
        worksFor: { '@type': 'Organization', name: advisor.organization },
        affiliation: { '@id': `${SITE}/#organization` },
        hasCredential: { '@type': 'EducationalOccupationalCredential', name: advisor.credential },
        alumniOf: advisor.alumniOf.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
        knowsAbout: advisor.knowsAbout,
        sameAs: [advisor.linkedin, advisor.website].filter(Boolean),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Advisors', item: `${SITE}/advisors` },
          { '@type': 'ListItem', position: 3, name: advisor.name, item: url },
        ],
      },
    ],
  };

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <section className={styles.section}>
        <div className="container">
          <Link href="/advisors" className={styles.back}>
            <ChevronLeft size={16} aria-hidden="true" /> All advisors
          </Link>

          <div className={styles.profile}>
            <AnimateOnScroll direction="left">
              <aside className={`glass-panel ${styles.profileCard}`}>
                <div className={styles.profilePhoto}>
                  <Image src={advisor.image} alt={advisor.name} fill sizes="200px" style={{ objectFit: 'cover' }} priority />
                </div>
                <h1 className={styles.profileName}>{advisor.name}</h1>
                <p className={styles.credential}>{advisor.jobTitle}</p>
                <p className={styles.org} style={{ justifyContent: 'center' }}>
                  <Building2 size={16} aria-hidden="true" /> {advisor.organization}
                </p>
                <p className={styles.org} style={{ justifyContent: 'center' }}>
                  <GraduationCap size={16} aria-hidden="true" /> {advisor.credential}
                </p>
                <div className={styles.links} style={{ justifyContent: 'center' }}>
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
                </div>
              </aside>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" delay={150}>
              <article className={styles.bioBody}>
                <span className={styles.eyebrow}>Advisor, Elitech Hub</span>
                <h2 className={styles.bioTitle}>About {advisor.plainName.split(' ')[0]}</h2>
                {advisor.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <h3 className={styles.areasTitle}>Areas of expertise</h3>
                <ul className={styles.areas}>
                  {advisor.knowsAbout.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </article>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
