import type { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import PriceDisplay from '@/components/PriceDisplay';
import ConsultationBookingSection from '../consultation/ConsultationBookingSection';
import {
  Compare,
  ConsultHero,
  Faq,
  FeatureCards,
  FinalCta,
  SectionHead,
  Steps,
  faqJsonLd,
  safeJsonLd,
} from '../consultation/ConsultSections';
import styles from '../consultation/consultation.module.css';
import { Brain, Path, ShieldCheck, Target, UserFocus, Video } from '@/components/icons';

const URL = 'https://www.elitechub.com/coaching';

export const metadata: Metadata = {
  title: 'Personalised Cybersecurity Coaching & Mentorship',
  description:
    'One-to-one cybersecurity coaching shaped around your goals and gaps. Every coaching plan starts with an assessment consultation, then a custom scope and price.',
  keywords: [
    'cybersecurity coaching Nigeria',
    'cybersecurity mentor',
    '1-on-1 cybersecurity training',
    'custom cybersecurity mentorship',
    'OSCP coaching',
  ],
  alternates: { canonical: URL },
  openGraph: {
    url: URL,
    title: 'Personalised Cybersecurity Coaching & Mentorship | Elitech Hub',
    description: 'One-to-one cybersecurity coaching shaped around your goals, gaps and career plans.',
    images: [{ url: 'https://www.elitechub.com/images/og-default.jpg' }],
    type: 'website',
  },
};

const FAQ = [
  {
    q: 'Can I buy three months of coaching straight away?',
    a: 'No. The assessment consultation comes first. We will not take payment for long-term coaching until we are sure we are the right fit for what you need.',
  },
  {
    q: 'Is the consultation fee refunded if I am not accepted for coaching?',
    a: 'No. The fee covers the time spent reviewing your profile and giving you a career assessment. Even if you do not go on to coaching, you leave with a clear roadmap.',
  },
  {
    q: 'What kind of goals is coaching for?',
    a: 'Goals that a standard programme does not cover well, such as preparing for a demanding certification like OSCP, working through a complex project, or moving into security management.',
  },
];

export default function CoachingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.elitechub.com/' },
          { '@type': 'ListItem', position: 2, name: 'Coaching & Mentorship', item: URL },
        ],
      },
      {
        '@type': 'Service',
        name: 'Personalised Cybersecurity Coaching and Mentorship',
        serviceType: 'Coaching and mentoring',
        url: URL,
        provider: { '@id': 'https://www.elitechub.com/#organization' },
        areaServed: 'Worldwide',
        description: 'One-to-one cybersecurity coaching shaped around your goals, gaps and career plans.',
      },
      faqJsonLd(FAQ),
    ],
  };

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className={styles.page}>
        <ConsultHero
          eyebrow="By assessment only"
          title={
            <>
              Coaching built around <em>your</em> goals, not a syllabus
            </>
          }
          lead="Not a bootcamp and not a recorded course. One-to-one mentorship that focuses on your weak spots and the career you are aiming for."
          primary={{ href: '#book', label: 'Start with an assessment' }}
          secondary={{ href: '#process', label: 'See the process' }}
          facts={[
            { icon: <UserFocus size={18} aria-hidden="true" />, text: 'Fully one-to-one' },
            { icon: <Video size={18} aria-hidden="true" />, text: 'Live video sessions' },
            { icon: <Path size={18} aria-hidden="true" />, text: 'Custom scope and price' },
          ]}
          quote="Coaching is for people with a specific target. If a programme serves you better, I will tell you."
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead
              kicker="Why coaching"
              title="Guidance that starts where you are"
              lead="A class moves at the pace of the room. Coaching moves at yours, on the problems that are actually holding you back."
            />
            <FeatureCards
              items={[
                {
                  icon: <Target size={26} />,
                  title: 'Specific to you',
                  text: 'No curriculum written for fifty people. Every session targets your own gaps and career goals.',
                },
                {
                  icon: <Brain size={26} />,
                  title: 'For hard goals',
                  text: 'Preparing for a demanding certification like OSCP, tackling a complex project, or stepping into management.',
                },
                {
                  icon: <ShieldCheck size={26} />,
                  title: 'From practitioners',
                  text: 'Guidance from people who do the work they teach. Every idea is tied to practical application.',
                },
              ]}
            />
          </div>
        </section>

        <section id="process" className={styles.sectionAlt} style={{ scrollMarginTop: '80px' }}>
          <div className={styles.container}>
            <SectionHead
              kicker="The process"
              title="Assessment first, then a plan made for you"
              lead="There are no fixed coaching packages, because no two people need the same thing."
            />
            <Steps
              items={[
                {
                  title: 'Assessment call',
                  text: (
                    <>
                      Everyone starts here. The standard 30-minute assessment is{' '}
                      <strong style={{ color: '#fff' }}>
                        <PriceDisplay courseId="consultation-30" fallback="₦30,000" />
                      </strong>
                      .
                    </>
                  ),
                },
                {
                  title: 'Goal and gap analysis',
                  text: 'We map your current skills against your target role and measure the distance between them.',
                },
                {
                  title: 'Proposal and price',
                  text: 'If we can genuinely help, you get a custom coaching scope with a clear price.',
                },
                {
                  title: 'Coaching sessions',
                  text: 'Regular one-to-one sessions around your schedule, focused only on reaching your goal.',
                },
              ]}
            />
          </div>
        </section>

        <section id="book" className={styles.section} style={{ scrollMarginTop: '80px' }}>
          <div className={styles.container}>
            <SectionHead
              kicker="Step one"
              title="Book your assessment consultation"
              lead="Most people choose 30 minutes. Pick the length that suits you, add your details and pay securely."
            />
            <ConsultationBookingSection />
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <SectionHead
              kicker="Good to know"
              title="Is coaching the right fit?"
              lead="We turn down more coaching applicants than we accept."
            />
            <Compare
              yesTitle="Coaching suits you if"
              yes={[
                'You have a specific, non-standard goal',
                'You want direct feedback on your own work',
                'You need a pace and schedule a class cannot offer',
              ]}
              noTitle="A programme may suit you better if"
              no={[
                'You are starting cybersecurity from scratch',
                'You want a structured, cohort-based curriculum',
                'You are looking for a lower cost route',
              ]}
            />
            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Compare the <Link href="/programs/professional" style={{ color: '#fca5a5' }}>16-Week Professional Programme</Link> and the{' '}
              <Link href="/ai-training" style={{ color: '#fca5a5' }}>AI-Powered Cybersecurity Programme</Link>.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead kicker="Questions" title="Frequently asked questions" />
            <Faq items={FAQ} />
          </div>
        </section>

        <FinalCta
          title="Ready to move faster?"
          text="Every coaching plan starts with one assessment call. Choose your session length and book today."
          href="#book"
          label="Book your assessment"
        />
      </div>
    </PageLayout>
  );
}
