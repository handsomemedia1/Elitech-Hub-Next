'use client';
import Link from 'next/link';
import styles from './page.module.css';

export default function BeforeCybersecurityLanding() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Before You Learn Cybersecurity, Understand What You&apos;re Starting.</h1>
        <p>
          Before Cybersecurity is an interactive orientation system designed to help you understand cybersecurity, explore where you might fit, identify what you need to learn first, and avoid wasting months learning in the wrong direction.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/before-cybersecurity/assessment" className={styles.primaryCta}>
            Take the Free Assessment
          </Link>
          <Link href="#explore" className={styles.secondaryCta}>
            Explore Before Cybersecurity
          </Link>
        </div>
        
        <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#888' }}>
          <p>Already have access? <Link href="/before-cybersecurity/dashboard" style={{ color: '#fff', textDecoration: 'underline' }}>Go to Dashboard</Link></p>
        </div>
      </section>

      {/* Problem Section */}
      <section id="explore" className={styles.section}>
        <h2>Most people start cybersecurity from the wrong place.</h2>
        <p>
          Beginners often jump straight into Kali Linux, penetration testing, certifications, programming, networking, SOC, cloud, or ethical hacking before understanding how those pieces actually relate to each other.
        </p>
        <p>
          The problem isn&apos;t a lack of motivation. The problem is a lack of orientation. You don&apos;t need to know everything before you start cybersecurity, but you do need to understand what you are starting.
        </p>
      </section>

      {/* Product Explanation */}
      <section className={styles.section} style={{ backgroundColor: '#111', borderRadius: '12px' }}>
        <h2>This is not another cybersecurity course.</h2>
        <p>
          Before Cybersecurity comes <strong>BEFORE</strong> the course. It is an orientation system designed to help someone understand the landscape, the foundations, the terminology, the work, the learning process, the risks, and the expectations before they commit significant time or money.
        </p>
      </section>

      {/* Features Grid */}
      <section className={styles.section}>
        <h2>What the product contains</h2>
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <h3>01 — The Guide</h3>
            <p>A deep visual guide explaining cybersecurity from the ground up. Not a textbook, but a map of the territory.</p>
          </div>
          <div className={styles.card}>
            <h3>02 — Reality Assessment</h3>
            <p>A structured assessment designed to reveal how you currently approach problems, systems, learning, and uncertainty.</p>
          </div>
          <div className={styles.card}>
            <h3>03 — Personalized Report</h3>
            <p>A personalized interpretation of your results, helping you discover if you are a Builder, Investigator, Defender, or Researcher.</p>
          </div>
          <div className={styles.card}>
            <h3>04 — Starting Point</h3>
            <p>A suggested starting direction based on your current understanding and interests.</p>
          </div>
          <div className={styles.card}>
            <h3>05 — 30/60/90 Roadmap</h3>
            <p>A practical first learning framework. Stop guessing what to do next.</p>
          </div>
          <div className={styles.card}>
            <h3>06 — Resource Library</h3>
            <p>Curated resources connected directly to your next steps and learning goals.</p>
          </div>
        </div>
      </section>

      {/* Pricing / Free vs Paid */}
      <section className={styles.section} style={{ textAlign: 'center' }}>
        <h2>Start your orientation</h2>
        <p style={{ margin: '0 auto 2rem' }}>Experience the free assessment or unlock the complete system.</p>
        
        <div className={styles.cardsGrid} style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Free Tier */}
          <div className={styles.card} style={{ borderTop: '4px solid #333', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Free Assessment</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: '#fff' }}>Free</div>
            <p style={{ marginBottom: '2rem', flex: 1 }}>Discover your basic profile and broad areas to explore.</p>
            <ul style={{ textAlign: 'left', color: '#a1a1aa', marginBottom: '2rem', lineHeight: '1.8' }}>
              <li>✓ 12-15 Question Assessment</li>
              <li>✓ Basic Profile Type</li>
              <li>✓ Suggested next step</li>
            </ul>
            <Link href="/before-cybersecurity/assessment" className={styles.secondaryCta} style={{ display: 'block', textAlign: 'center' }}>
              Start Free Assessment
            </Link>
          </div>

          {/* Paid Tier */}
          <div className={styles.card} style={{ borderTop: '4px solid #C3151C', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Full Experience</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: '#fff' }}>
              <span style={{ fontSize: '1.5rem', verticalAlign: 'super' }}>$</span>49
            </div>
            <p style={{ marginBottom: '2rem', flex: 1 }}>Unlock the guide, personalized report, and roadmap.</p>
            <ul style={{ textAlign: 'left', color: '#a1a1aa', marginBottom: '2rem', lineHeight: '1.8' }}>
              <li>✓ Full Interactive Guide & PDF</li>
              <li>✓ Comprehensive Assessment</li>
              <li>✓ Detailed Gap Analysis</li>
              <li>✓ 30/60/90 Day Roadmap</li>
              <li>✓ Curated Resource Library</li>
              <li>✓ Lifetime Updates</li>
            </ul>
            <button className={styles.primaryCta} style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
              Get the Full Experience
            </button>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
              Supports Paystack, Flutterwave, and International Cards.
            </div>
          </div>
        </div>
      </section>

      {/* Trust Panel & E-E-A-T */}
      <section className={styles.trustPanel}>
        <h2>Built by Elitech-Hub</h2>
        <p>
          Created by Elijah Adegboyega Adeyeye, Founder & Lead Instructor. Elitech-Hub is a cybersecurity company focused on practical learning, research, and building secure systems.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '2rem' }}>
          Our principles are informed by frameworks from NIST, CISA, OWASP, and MITRE. We do not guarantee employment, but we do guarantee a clear map of what it takes to succeed.
        </p>
      </section>
    </div>
  );
}
