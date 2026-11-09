import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import layoutStyles from '@/components/PageLayout.module.css';
import styles from './policies.module.css';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.elitechub.com/policies' },
  title: 'Terms of Service & Privacy Policy',
  description: 'Elitech Hub Terms of Service and Privacy Policy. Learn about our data practices, user rights, and platform guidelines.',
  robots: { index: true, follow: true },
};

export default function PoliciesPage() {
  return (
    <PageLayout>
      <AnimateOnScroll>
        <section className={layoutStyles.pageHero} style={{ minHeight: '35vh' }}>
          <span className={layoutStyles.pageHeroLabel}>Legal Documents</span>
          <h1 className={layoutStyles.pageHeroTitle}>
            Terms &amp; <span className={layoutStyles.accentRed}>Privacy Policy</span>
          </h1>
          <p className={layoutStyles.pageHeroSub}>Last Updated: November 2026</p>
        </section>
      </AnimateOnScroll>

      <section className={layoutStyles.section}>
        <div className={styles.container}>

          {/* Quick Nav */}
          <div className={styles.quickNav}>
            <Link href="#terms" className={styles.quickNavLink}>Terms of Service</Link>
            <Link href="#privacy" className={styles.quickNavLink}>Privacy Policy</Link>
            <Link href="#cookies" className={styles.quickNavLink}>Cookie Policy</Link>
            <Link href="#refund" className={styles.quickNavLink}>Refund Policy</Link>
          </div>

          {/* Terms of Service */}
          <div id="terms" className={styles.policySection}>
            <h2 className={styles.policyTitle}>📋 Terms of Service</h2>
            <p className={styles.policyText}>By accessing and using Elitech Hub (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. Please read them carefully before enrolling in any program or using our services.</p>

            <h3 className={styles.subTitle}>1. Acceptance of Terms</h3>
            <p className={styles.policyText}>By registering or using any part of this platform, you confirm that you are at least 16 years old and agree to these terms in full. If you are under 18, you must have parental or guardian consent.</p>

            <h3 className={styles.subTitle}>2. Services Provided</h3>
            <p className={styles.policyText}>Elitech Hub provides cybersecurity training programs, educational content, mentorship, and career placement support. All programs are delivered virtually unless otherwise stated.</p>

            <h3 className={styles.subTitle}>3. Payment &amp; Enrollment</h3>
            <ul className={styles.policyList}>
              <li>Fees must be paid before access to program materials is granted.</li>
              <li>We accept bank transfer and online payments through Paystack.</li>
              <li>Installment payment plans are available for the 16-Week program — contact us before enrolling.</li>
              <li>Prices are listed in NGN and USD; currency conversion is approximate.</li>
            </ul>

            <h3 className={styles.subTitle}>4. Code of Conduct</h3>
            <ul className={styles.policyList}>
              <li>All cybersecurity techniques taught are for ethical, legal, and defensive purposes only.</li>
              <li>Using skills learned at Elitech Hub to perform unauthorized access on any system is strictly prohibited.</li>
              <li>Respect all community members, instructors, and staff at all times.</li>
              <li>Sharing course materials externally without written permission is prohibited.</li>
            </ul>

            <h3 className={styles.subTitle}>5. Certificates &amp; Credentials</h3>
            <p className={styles.policyText}>Certificates are issued only upon successful completion of a program (attendance + assessments). Elitech Hub certificates are not substitutes for industry certifications (CompTIA, CEH, etc.) but prepare you for them.</p>

            <h3 className={styles.subTitle}>6. Intellectual Property</h3>
            <p className={styles.policyText}>All course materials, videos, slides, and resources are the intellectual property of Elitech Hub. You are granted a personal, non-transferable license to access them for your own learning only.</p>

            <h3 className={styles.subTitle}>7. Limitation of Liability</h3>
            <p className={styles.policyText}>Elitech Hub provides educational services. We provide unpaid internship experience but we do not guarantee job placement or employment after program completion. We are not liable for any losses resulting from the application of skills learned on this platform.</p>
          </div>

          {/* Privacy Policy */}
          <div id="privacy" className={styles.policySection}>
            <h2 className={styles.policyTitle}>🔒 Privacy Policy</h2>
            <p className={styles.policyText}>Elitech Hub Limited (RC: 8693883), based in Ibadan, Oyo State, Nigeria, is the data controller for personal data collected through this website. This policy explains what we collect, why, who receives it, and your rights under the Nigeria Data Protection Act 2023 (NDPA), the GAID 2025 and, where it applies to you, the EU and UK GDPR.</p>

            <h3 className={styles.subTitle}>Information We Collect</h3>
            <ul className={styles.policyList}>
              <li><strong>Details you give us:</strong> name, email, phone or WhatsApp number, country, city and anything you write in applications, contact, volunteer, researcher, writer and newsletter forms.</li>
              <li><strong>Account data:</strong> login details (passwords are stored only as secure hashes), profile information, course progress and certificate records.</li>
              <li><strong>Assessment data:</strong> your answers and results if you take the Before Cybersecurity assessment.</li>
              <li><strong>Payment data:</strong> payment reference, amount and status. Card details are handled by Paystack and we never see or store them.</li>
              <li><strong>Chatbot messages:</strong> what you type to our AI assistant. Please do not share sensitive personal information in the chat.</li>
              <li><strong>Technical data:</strong> IP address and device information, used for security, rate limiting and showing prices for your country.</li>
              <li><strong>Usage data:</strong> pages visited and how you interact with the site, only if you accept analytics cookies.</li>
            </ul>

            <h3 className={styles.subTitle}>Why We Use It and Our Legal Basis</h3>
            <ul className={styles.policyList}>
              <li><strong>Contract:</strong> to process applications and payments, deliver programmes, send course materials, and issue and verify certificates.</li>
              <li><strong>Consent:</strong> for analytics cookies and marketing messages. You can withdraw consent at any time.</li>
              <li><strong>Legitimate interests:</strong> to answer enquiries, keep the platform secure and prevent fraud or abuse.</li>
              <li><strong>Legal obligation:</strong> to keep records that the law requires, such as tax and accounting records.</li>
            </ul>

            <h3 className={styles.subTitle}>Who Receives Your Data</h3>
            <p className={styles.policyText}>We do not sell your personal data. We share it only with service providers that help us run the platform:</p>
            <ul className={styles.policyList}>
              <li><strong>Supabase:</strong> database and file storage</li>
              <li><strong>Vercel and Cloudflare:</strong> website hosting, delivery and security</li>
              <li><strong>Paystack:</strong> payment processing</li>
              <li><strong>Resend:</strong> sending email</li>
              <li><strong>Google (Gemini):</strong> generating AI assistant replies from your chat messages</li>
              <li><strong>Telegram:</strong> alerting our staff to new enquiries, including the details you submitted</li>
              <li><strong>Google Tag Manager and Analytics, Microsoft Clarity, Vercel Analytics and Cloudflare Web Analytics:</strong> measuring site use, only if you accept analytics cookies</li>
            </ul>
            <p className={styles.policyText}>We may also disclose data where the law or a competent authority requires it. If you contact us on WhatsApp, WhatsApp&apos;s own terms also apply.</p>

            <h3 className={styles.subTitle}>International Transfers</h3>
            <p className={styles.policyText}>Some of these providers process data outside Nigeria. Where that happens, we rely on a transfer basis recognised under the NDPA, such as appropriate contractual safeguards or your consent.</p>

            <h3 className={styles.subTitle}>Data Retention</h3>
            <p className={styles.policyText}>We retain your data for as long as you have an active relationship with Elitech Hub, plus 5 years for compliance. Certificate records are retained indefinitely so that credentials can be verified. Analytics data is kept according to each provider&apos;s retention settings.</p>

            <h3 className={styles.subTitle}>Your Rights</h3>
            <ul className={styles.policyList}>
              <li>Be told how your data is used, and get a copy of it</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion, where the law allows</li>
              <li>Restrict or object to processing, including direct marketing</li>
              <li>Receive your data in a portable format</li>
              <li>Withdraw consent at any time, without affecting earlier processing</li>
              <li>Not be subject to decisions based solely on automated processing that significantly affect you</li>
            </ul>
            <p className={styles.policyText}>To exercise these rights, or to reach our data protection contact, email <a href="mailto:info@elitechub.com" style={{ color: '#c3151c' }}>info@elitechub.com</a>. If you are not satisfied with our response, you may complain to the <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" style={{ color: '#c3151c' }}>Nigeria Data Protection Commission</a>.</p>

            <h3 className={styles.subTitle}>Children</h3>
            <p className={styles.policyText}>Our services are for people aged 16 and over. Anyone under 18 needs the consent of a parent or guardian. If you believe a child has given us data without that consent, contact us and we will address it.</p>

            <h3 className={styles.subTitle}>Security and Data Breaches</h3>
            <p className={styles.policyText}>We use technical and organisational measures to protect your data, including encrypted connections and access controls. If a breach is likely to put your rights at risk, we will notify the Nigeria Data Protection Commission within 72 hours of becoming aware of it, and inform you where the law requires.</p>
          </div>

          {/* Cookie Policy */}
          <div id="cookies" className={styles.policySection}>
            <h2 className={styles.policyTitle}>🍪 Cookie Policy</h2>
            <p className={styles.policyText}>We use cookies and similar browser storage. Analytics tools stay off unless you choose Accept in our cookie banner.</p>
            <ul className={styles.policyList}>
              <li><strong>Strictly necessary (always on):</strong> keep you logged in and protect the site, including our login cookies and Cloudflare security cookies.</li>
              <li><strong>Preferences (always on):</strong> browser storage that remembers your cookie choice, pricing region, dismissed banners and assessment or reading progress.</li>
              <li><strong>Analytics (only if you accept):</strong> Google Tag Manager and Google Analytics, such as <code>_ga</code> cookies; Microsoft Clarity, such as <code>_clck</code> and <code>_clsk</code>, which records interactions like clicks, scrolling and pages visited; plus Vercel Analytics and Cloudflare Web Analytics, which measure site traffic.</li>
            </ul>
            <p className={styles.policyText}>You can change your mind at any time using <strong>Cookie Settings</strong> in the website footer. We do not currently use advertising cookies. If that changes, we will update this policy and ask for your consent first.</p>
          </div>

          {/* Refund Policy */}
          <div id="refund" className={styles.policySection}>
            <h2 className={styles.policyTitle}>💰 Payment & Refund Policy</h2>
            <p className={styles.policyText}>We strive to provide premium educational content and hands-on experiences.</p>
            <ul className={styles.policyList}>
              <li><strong>All payments are strictly non-refundable.</strong> We encourage students to ask questions and review course details carefully before making a payment.</li>
              <li>Installment payment plans are strictly limited to exactly two (2) installments, and are only available for the 16-Week Professional Program. Split payments are not allowed for the 6-Week Bootcamp.</li>
              <li>Certificates are only issued after full completion of the curriculum, capstone projects, and full settlement of any outstanding tuition.</li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactBox}>
            <h3>Questions About These Policies?</h3>
            <p>Contact our team at <a href="mailto:info@elitechub.com">info@elitechub.com</a> or via WhatsApp at +234 708 196 8062.</p>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
