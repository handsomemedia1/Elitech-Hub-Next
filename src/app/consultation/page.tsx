import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import ConsultationBookingSection from './ConsultationBookingSection';
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
} from './ConsultSections';
import styles from './consultation.module.css';
import { Briefcase, Clock, Crosshair, GraduationCap, Lock, Map, Target, Users, Video } from '@/components/icons';

const URL = 'https://www.elitechub.com/consultation';

export const metadata: Metadata = {
  title: 'Cybersecurity Career & Transition Consultation',
  description:
    'Book a one-to-one cybersecurity career consultation with Elijah Adeyeye. Get an honest assessment, a career map built around your background, and a clear roadmap.',
  keywords: [
    'cybersecurity career consultation',
    'career transition to cybersecurity',
    'cybersecurity mentor Nigeria',
    'cybersecurity roadmap',
    'cybersecurity career advice',
  ],
  alternates: { canonical: URL },
  openGraph: {
    url: URL,
    title: 'Cybersecurity Career & Transition Consultation | Elitech Hub',
    description:
      'A one-to-one session that tells you honestly where you stand and exactly what to do next in cybersecurity.',
    images: [{ url: 'https://www.elitechub.com/images/og-default.jpg' }],
    type: 'website',
  },
};

const FAQ = [
  {
    q: 'Who is this consultation for?',
    a: 'Anyone thinking about a cybersecurity career who feels overwhelmed by the options. It is especially useful if you are moving from another field, such as banking, medicine or teaching, and want to know how your existing skills carry over.',
  },
  {
    q: 'Do I have to join an Elitech Hub programme afterwards?',
    a: 'No. The consultation stands on its own. If self-study or another provider suits your goals better, we will tell you.',
  },
  {
    q: 'How do I choose my call time?',
    a: 'Once your payment is confirmed, we email you a short questionnaire and a link to pick a time that works for you.',
  },
  {
    q: 'Can I reschedule my session?',
    a: 'Yes, as long as you give at least 24 hours notice. Sessions missed without notice are not refunded.',
  },
];

export default function ConsultationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.elitechub.com/' },
          { '@type': 'ListItem', position: 2, name: 'Consultation', item: URL },
        ],
      },
      {
        '@type': 'Service',
        name: 'Cybersecurity Career & Transition Consultation',
        serviceType: 'Career consultation',
        url: URL,
        provider: { '@id': 'https://www.elitechub.com/#organization' },
        areaServed: 'Worldwide',
        description:
          'One-to-one cybersecurity career consultation: an honest assessment, a career map built around your background, and a clear roadmap.',
      },
      faqJsonLd(FAQ),
    ],
  };

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className={styles.page}>
        <ConsultHero
          eyebrow="One-to-one with the founder"
          title={
            <>
              Know exactly where you fit in <em>cybersecurity</em>
            </>
          }
          lead="A private session that looks at your background, the way you think and your goals, then tells you honestly which path suits you and what to do next."
          primary={{ href: '#book', label: 'Book your session' }}
          secondary={{ href: '#how-it-works', label: 'How it works' }}
          facts={[
            { icon: <Video size={18} aria-hidden="true" />, text: 'Live video call' },
            { icon: <Clock size={18} aria-hidden="true" />, text: '15 to 120 minutes' },
            { icon: <Lock size={18} aria-hidden="true" />, text: 'Secure payment by Paystack' },
          ]}
          quote="I will tell you the truth about your path, even when it is not what you hoped to hear."
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead
              kicker="Who it is for"
              title="Built for people at a crossroads"
              lead="Most people who book are capable and motivated. What they lack is a clear, honest picture of the road ahead."
            />
            <FeatureCards
              items={[
                {
                  icon: <Briefcase size={26} />,
                  title: 'Career changers',
                  text: 'You work in banking, health, teaching or another field and want to know how your experience carries into security.',
                },
                {
                  icon: <GraduationCap size={26} />,
                  title: 'Students and graduates',
                  text: 'You have heard about cybersecurity but cannot tell which certifications, roles or courses are worth your time.',
                },
                {
                  icon: <Users size={26} />,
                  title: 'IT professionals',
                  text: 'You already work in tech and want a focused plan for moving into a security role without starting from zero.',
                },
              ]}
            />
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <SectionHead
              kicker="What you leave with"
              title="Clarity you can act on the same day"
            />
            <FeatureCards
              numbered
              items={[
                {
                  icon: <Target size={26} />,
                  title: 'An honest assessment',
                  text: 'We look at your background, thinking style and natural strengths to find the area of cybersecurity that fits you.',
                },
                {
                  icon: <Map size={26} />,
                  title: 'A realistic career map',
                  text: 'What the move from your current role really takes, including the time and money involved.',
                },
                {
                  icon: <Crosshair size={26} />,
                  title: 'A precise roadmap',
                  text: 'What to learn, in what order, and what to skip. No generic advice.',
                },
              ]}
            />
          </div>
        </section>

        <section id="book" className={styles.section} style={{ scrollMarginTop: '80px' }}>
          <div className={styles.container}>
            <SectionHead
              kicker="Book your session"
              title="Choose how much time you need"
              lead="Every session is a live video call. Pick a length, add your details, and pay securely."
            />
            <ConsultationBookingSection />
          </div>
        </section>

        <section id="how-it-works" className={styles.sectionAlt} style={{ scrollMarginTop: '80px' }}>
          <div className={styles.container}>
            <SectionHead kicker="How it works" title="From booking to a plan in four steps" />
            <Steps
              items={[
                { title: 'Book and pay', text: 'Choose your session length and pay securely online.' },
                {
                  title: 'Fill a short form',
                  text: 'Tell us about your background, CV and goals so the call goes straight to what matters.',
                },
                { title: 'Meet on video', text: 'A direct, honest and technical conversation about your path forward.' },
                {
                  title: 'Leave with a plan',
                  text: 'A certification, a programme, or a self-study route. You will know your next move.',
                },
              ]}
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead
              kicker="Straight talk"
              title="What this is, and what it is not"
              lead="We would rather lose a booking than sell you false hope."
            />
            <Compare
              yesTitle="What you can expect"
              yes={[
                'An honest view of where you stand today',
                'A path chosen for your background, not a template',
                'Advice on what to skip, so you save time and money',
                'A straight answer if a programme is not right for you',
              ]}
              noTitle="What we will not promise"
              no={[
                'A guaranteed job at the end',
                'That cybersecurity will feel easy',
                'A shortcut if the realistic route is longer',
                'A sales pitch for our own programmes',
              ]}
            />
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <SectionHead kicker="Questions" title="Frequently asked questions" />
            <Faq items={FAQ} />
          </div>
        </section>

        <FinalCta
          title="Stop guessing. Start moving."
          text="One honest conversation can save you months of studying the wrong things."
          href="#book"
          label="Book your session"
        />
      </div>
    </PageLayout>
  );
}
