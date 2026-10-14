import PageLayout from '@/components/PageLayout';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import ConsultationBookingSection from './ConsultationBookingSection';
import styles from './consultation.module.css';
import { Target, Crosshair, Map, ShieldAlert, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Cybersecurity Career & Transition Consultation',
  description: 'Book a personalized cybersecurity career transition consultation. Get behavioral assessment, skill mapping, and a realistic career roadmap.',
  keywords: [
    'cybersecurity career consultation',
    'career transition to cybersecurity',
    'cybersecurity mentor Nigeria',
    'cybersecurity roadmap',
    'cybersecurity assessment',
  ],
  alternates: {
    canonical: 'https://www.elitechub.com/consultation',
  },
  openGraph: {
    url: 'https://www.elitechub.com/consultation',
    title: 'Cybersecurity Career & Transition Consultation | Elitech Hub',
    description: 'Book a personalized cybersecurity career transition consultation. Get behavioral assessment, skill mapping, and a realistic career roadmap.',
    images: [{ url: 'https://www.elitechub.com/images/og-default.jpg' }],
    type: 'website',
  }
};

export default function ConsultationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.elitechub.com/" },
          { "@type": "ListItem", "position": 2, "name": "Consultation", "item": "https://www.elitechub.com/consultation" }
        ]
      },
      {
        "@type": "Service",
        "name": "Cybersecurity Career & Transition Consultation",
        "serviceType": "Consulting",
        "provider": {
          "@type": "Organization",
          "name": "Elitech Hub",
          "url": "https://www.elitechub.com"
        },
        "description": "Personalized cybersecurity career transition consultation, behavioral assessment, skill mapping, and realistic career roadmapping."
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
            Cybersecurity Career & <span className="text-gradient-primary">Transition Consultation</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Stop guessing. Get a personalized behavioral assessment, skill mapping, and a realistic roadmap for your cybersecurity career transition.
          </p>
          <a href="#pricing" className="premium-button">Book Your Session</a>
        </AnimateOnScroll>
      </section>

      {/* What this is */}
      <section className={styles.section}>
        <AnimateOnScroll direction="up">
          <h2 className={styles.sectionTitle}>What is this consultation?</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Target /> Behavioral Assessment</h3>
              <p className="text-gray-400 mt-2">We analyze your background, thinking style, and natural inclinations to find the exact cybersecurity domain that fits you.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Map /> Career Mapping</h3>
              <p className="text-gray-400 mt-2">A realistic breakdown of what it takes to transition from your current role into cybersecurity, including time and financial commitments.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Crosshair /> Actionable Roadmap</h3>
              <p className="text-gray-400 mt-2">We provide a precise learning path. No generic advice. We tell you what to learn, in what order, and what to skip.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Pricing/Options */}
      <section id="pricing" className={styles.section}>
        <AnimateOnScroll direction="fade">
          <h2 className={styles.sectionTitle}>Consultation Options</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">
            Choose the duration that fits your needs. All sessions are conducted via live video call.
          </p>
          
          <ConsultationBookingSection />
        </AnimateOnScroll>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <AnimateOnScroll direction="left">
          <h2 className={styles.sectionTitle}>How the process works</h2>
          <div className="max-w-3xl mx-auto">
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>1. Book & Pay</h4>
                <p className={styles.processText}>Select your duration and complete payment through our secure gateway.</p>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>2. Pre-Consultation Form</h4>
                <p className={styles.processText}>You will receive a brief form to fill out regarding your current background, CV, and goals. This ensures we don&apos;t waste paid time on basic discovery.</p>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>3. The Live Session</h4>
                <p className={styles.processText}>We connect via video call for a direct, honest, and highly technical discussion about your path forward.</p>
              </div>
              <div className={styles.processItem}>
                <h4 className={styles.processTitle}>4. Action Plan</h4>
                <p className={styles.processText}>You leave with a clear understanding of your next steps, whether that is taking a specific certification, joining a bootcamp, or self-studying.</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Warning */}
      <section className={styles.section}>
        <AnimateOnScroll direction="up">
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitle}><ShieldAlert size={28} /> What this consultation does NOT guarantee</h3>
            <div className={styles.warningText}>
              <p className="mb-4">We are brutally honest. This consultation <strong>does not guarantee you a job</strong>. It does not guarantee that you will find cybersecurity easy.</p>
              <p>If we assess that your background or current situation makes an immediate transition unrealistic, we will tell you the truth. We will not sell you false hope. We will give you the precise, difficult steps required to actually succeed.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>Who is this consultation for? <ChevronDown size={20} /></summary>
            <div className={styles.faqAnswer}>
              This is for anyone considering a career in cybersecurity but feeling overwhelmed by the options. It is especially useful for professionals transitioning from other fields (like banking, medicine, or teaching) who need to know how to leverage their existing skills.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>Do I have to enroll in Elitech Hub&apos;s bootcamp after this? <ChevronDown size={20} /></summary>
            <div className={styles.faqAnswer}>
              No. The consultation is completely independent. If self-study or another provider is a better fit for your specific goals, we will tell you.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>Can I reschedule my session? <ChevronDown size={20} /></summary>
            <div className={styles.faqAnswer}>
              Yes, provided you give at least 24 hours notice. Sessions missed without notice are non-refundable.
            </div>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <AnimateOnScroll direction="up">
          <h2 className={styles.ctaTitle}>Stop guessing. Start executing.</h2>
          <p className={styles.ctaText}>
            Get the clarity you need to make the right career decisions.
          </p>
          <a href="#pricing" className="premium-button">Book Your Consultation</a>
        </AnimateOnScroll>
      </section>
    </PageLayout>
  );
}
