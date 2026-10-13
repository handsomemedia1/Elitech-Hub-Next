import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PriceDisplay from '@/components/PriceDisplay';
import styles from '../consultation/consultation.module.css';
import { 
  Target, ChevronDown, Brain, ShieldCheck, ShieldAlert
} from 'lucide-react';

export const metadata = {
  title: 'Personalised Cybersecurity Coaching | Elitech Hub',
  description: 'Bespoke 1-on-1 cybersecurity coaching. Mentorship tailored entirely to your specific goals, gaps, and career aspirations. Start with a mandatory assessment consultation.',
  keywords: [
    'cybersecurity coaching Nigeria',
    'cybersecurity mentor',
    '1-on-1 cybersecurity training',
    'custom cybersecurity mentorship',
  ],
  alternates: {
    canonical: 'https://www.elitechub.com/coaching',
  },
  openGraph: {
    url: 'https://www.elitechub.com/coaching',
    title: 'Personalised Cybersecurity Coaching | Elitech Hub',
    description: 'Bespoke 1-on-1 cybersecurity coaching. Mentorship tailored entirely to your specific goals, gaps, and career aspirations.',
    type: 'website',
  }
};

export default function CoachingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.elitechub.com/" },
          { "@type": "ListItem", "position": 2, "name": "Coaching", "item": "https://www.elitechub.com/coaching" }
        ]
      },
      {
        "@type": "Service",
        "name": "Personalised Cybersecurity Coaching",
        "serviceType": "Coaching & Mentoring",
        "provider": {
          "@type": "Organization",
          "name": "Elitech Hub",
          "url": "https://www.elitechub.com"
        },
        "description": "Bespoke 1-on-1 cybersecurity coaching tailored entirely to your specific goals, gaps, and career aspirations."
      }
    ]
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <AnimateOnScroll direction="fade">
          <h1 className={styles.heroTitle}>
            Personalised <span className="text-gradient-primary">Cybersecurity Coaching</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Not a generic bootcamp. Not a pre-recorded course. This is bespoke 1-on-1 mentorship tailored entirely to your specific goals, gaps, and career aspirations.
          </p>
          <a href="#process" className="premium-button">Start the Process</a>
        </AnimateOnScroll>
      </section>

      {/* What this is */}
      <section className={styles.section}>
        <AnimateOnScroll direction="up">
          <h2 className={styles.sectionTitle}>Why Personalised Coaching?</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Target /> Highly Specific</h3>
              <p className="text-gray-400 mt-2">You don&apos;t need a curriculum designed for 50 people. You need guidance focused exclusively on your unique weaknesses and career targets.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Brain /> Advanced Guidance</h3>
              <p className="text-gray-400 mt-2">Whether you are preparing for a difficult certification (like OSCP), tackling a complex project, or moving into management.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><ShieldCheck /> Direct Mentorship</h3>
              <p className="text-gray-400 mt-2">Work directly with industry veterans who actively practice what they teach. No theory without practical application.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* How it works */}
      <section id="process" className={styles.section}>
        <AnimateOnScroll direction="left">
          <h2 className={styles.sectionTitle}>The Coaching Process</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">
            We do not sell fixed-price coaching packages because every candidate is different. We must first assess your needs.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>1. Mandatory Assessment Consultation</h4>
                <p className={styles.processText}>
                  Before we accept anyone for coaching, you must book a 30-minute assessment consultation. <br/>
                  <strong className="text-white mt-2 block">Assessment Cost: <PriceDisplay courseId="consultation-30" fallback="₦30,000" /></strong>
                </p>
                <div className="mt-4">
                  <Link href="/consultation" className="premium-button-outline">Book Assessment Consultation</Link>
                </div>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>2. Goal & Gap Analysis</h4>
                <p className={styles.processText}>During the assessment, we analyze your current technical baseline, your ultimate career goal, and the exact delta between the two.</p>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>3. Proposal & Pricing</h4>
                <p className={styles.processText}>If we determine that we can genuinely help you, we will design a custom coaching scope and provide a specific price based on the required time and expertise.</p>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>4. Execution</h4>
                <p className={styles.processText}>We begin 1-on-1 sessions, structured around your schedule, focusing purely on getting you to your goal.</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Warning */}
      <section className={styles.section}>
        <AnimateOnScroll direction="up">
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitle}><ShieldAlert size={28} /> Important Notice</h3>
            <div className={styles.warningText}>
              <p className="mb-4">We reject more coaching applicants than we accept.</p>
              <p>If your goals are better served by our standard <strong>16-Week Professional Programme</strong> or our <strong>6-Week Bootcamp</strong>, we will redirect you there during the assessment. Coaching is reserved for specialized, non-standard requirements.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>Can I just buy 3 months of coaching directly? <ChevronDown size={20} /></summary>
            <div className={styles.faqAnswer}>
              No. The 30-minute assessment is mandatory. We refuse to take your money for long-term coaching until we have verified that we are the right fit for your specific needs.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>Is the consultation fee refundable if I am not accepted for coaching? <ChevronDown size={20} /></summary>
            <div className={styles.faqAnswer}>
              No. The consultation fee compensates our experts for their time in analyzing your profile and providing you with a career assessment. Even if you don&apos;t proceed to coaching, you will leave the consultation with a clear roadmap.
            </div>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <AnimateOnScroll direction="up">
          <h2 className={styles.ctaTitle}>Ready to accelerate your career?</h2>
          <p className={styles.ctaText}>
            Step 1 is the 30-minute assessment consultation.
          </p>
          <Link href="/consultation" className="premium-button">Book Assessment (<PriceDisplay courseId="consultation-30" fallback="₦30,000" />)</Link>
        </AnimateOnScroll>
      </section>
    </PageLayout>
  );
}
