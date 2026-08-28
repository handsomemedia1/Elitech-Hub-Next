import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import layoutStyles from '@/components/PageLayout.module.css';
import styles from './web-development.module.css';
import { Globe, CheckCircle2, ChevronDown, ArrowRight, ArrowLeft, Code, Zap, Shield, Star, Layout, Smartphone, Search, TrendingUp } from 'lucide-react';
import { PricingTiers, PricingTierProps } from '@/components/PricingTiers';

export const metadata = {
  title: 'Custom Website Development in Nigeria | Secure, SEO-Optimised | Elitech Hub',
  description: 'Elitech Hub builds premium custom websites and web applications for businesses in Lagos, Ibadan, Abuja, and across Nigeria. Fast, secure, SEO-optimised, and built to convert.',
  keywords: [
    'custom website development Nigeria',
    'web development company Lagos',
    'website development Ibadan',
    'web development agency Nigeria',
    'custom web application Nigeria',
    'secure website development Nigeria',
    'SEO website Nigeria',
    'Next.js developer Nigeria',
    'React developer Lagos',
    'ecommerce website Nigeria',
    'business website Nigeria',
    'web developer Ibadan',
    'affordable web development Nigeria',
    'professional website design Nigeria',
  ],
  alternates: {
    canonical: 'https://elitechub.com/services/web-development',
  },
  openGraph: {
    url: 'https://elitechub.com/services/web-development',
    title: 'Custom Website Development in Nigeria | Secure, SEO-Optimised | Elitech Hub',
    description: 'Elitech Hub builds premium custom websites and web applications for businesses in Lagos, Ibadan, Abuja, and across Nigeria. Fast, secure, SEO-optimised, and built to convert.',
  }
};

export default function WebDevelopmentPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elitechub.com/" },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://elitechub.com/services" },
          { "@type": "ListItem", "position": 3, "name": "Web Development", "item": "https://elitechub.com/services/web-development" }
        ]
      },
      {
        "@type": "Service",
        "name": "Custom Website Development Nigeria",
        "serviceType": "Web Development",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Elitech Hub",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Lagos",
            "addressRegion": "LA",
            "addressCountry": "NG"
          },
          "url": "https://elitechub.com"
        },
        "areaServed": ["Lagos", "Ibadan", "Abuja", "Nigeria"],
        "description": "Premium custom websites and web applications built for performance, security, and SEO."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does website development cost in Nigeria?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The cost of website development varies depending on the complexity, features, and requirements of your project. We offer customized solutions tailored to your budget and business goals. Contact us for a free quote."
            }
          },
          {
            "@type": "Question",
            "name": "How long to build a website?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A standard business website typically takes 2-4 weeks from discovery to launch. Complex web applications or ecommerce platforms may take 6-12 weeks depending on the scope."
            }
          },
          {
            "@type": "Question",
            "name": "Do you build ecommerce sites?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we build robust, secure, and scalable ecommerce websites that provide excellent user experiences and integrate seamlessly with local and international payment gateways."
            }
          },
          {
            "@type": "Question",
            "name": "Is the website SEO optimised?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. We build all our websites with technical SEO best practices in mind from day one, ensuring your site is fast, mobile-friendly, and easily discoverable by search engines."
            }
          }
        ]
      }
    ]
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className={styles.pageContainer}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/services" className="back-link">
            <ArrowLeft size={16} /> Back to Services
          </Link>
        </nav>

        {/* Hero Section */}
        <section className={styles.heroSection} style={{ backgroundImage: "linear-gradient(135deg, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.75) 100%), url('/assets/images/programs-hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <AnimateOnScroll direction="up">
            <div className={styles.badge}>
              <Globe className={styles.badgeIcon} />
              <span>WEB DEVELOPMENT</span>
            </div>
            <h1 className={styles.heroTitle}>Premium Websites Built for Nigerian Businesses</h1>
            <p className={styles.heroSubtitle}>
              We craft fast, secure, and SEO-ready web experiences that drive results,
              engage users, and scale with your business.
            </p>
            <div className={styles.metaIcons}>
              <div className={styles.metaItem}>
                <Shield className={styles.metaIcon} />
                <span>Secure by Design</span>
              </div>
              <div className={styles.metaItem}>
                <Search className={styles.metaIcon} />
                <span>SEO Optimised</span>
              </div>
              <div className={styles.metaItem}>
                <Smartphone className={styles.metaIcon} />
                <span>Mobile First</span>
              </div>
              <div className={styles.metaItem}>
                <Zap className={styles.metaIcon} />
                <span>Fast Delivery</span>
              </div>
            </div>
            
            <div className={styles.ctaGroup}>
              <Link href="/portfolio" className="premium-button">
                View Portfolio <ArrowRight size={20} />
              </Link>
              <Link href="#pricing" className="premium-button secondary">
                View Prices
              </Link>
            </div>
          </AnimateOnScroll>
        </section>

        {/* What We Build */}
        <section className={styles.whatWeBuildSection}>
          <AnimateOnScroll direction="fade">
            <h2 className={styles.sectionTitle}>What We Build</h2>
            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <Layout className={styles.cardIcon} />
                <h3>Business Websites</h3>
                <p>Professional online presence for corporate brands and SMEs.</p>
                <ul className={styles.cardFeatures}>
                  <li><CheckCircle2 size={16} /> Lead generation forms</li>
                  <li><CheckCircle2 size={16} /> CMS integration</li>
                  <li><CheckCircle2 size={16} /> Mobile-responsive</li>
                </ul>
              </div>
              <div className={styles.card}>
                <Code className={styles.cardIcon} />
                <h3>Web Applications</h3>
                <p>Complex, interactive web apps tailored to your business logic.</p>
                <ul className={styles.cardFeatures}>
                  <li><CheckCircle2 size={16} /> Custom dashboards</li>
                  <li><CheckCircle2 size={16} /> API integrations</li>
                  <li><CheckCircle2 size={16} /> Scalable architecture</li>
                </ul>
              </div>
              <div className={styles.card}>
                <Globe className={styles.cardIcon} />
                <h3>E-commerce Stores</h3>
                <p>Secure online stores optimized for sales and conversions.</p>
                <ul className={styles.cardFeatures}>
                  <li><CheckCircle2 size={16} /> Payment gateway setup</li>
                  <li><CheckCircle2 size={16} /> Inventory management</li>
                  <li><CheckCircle2 size={16} /> Cart abandonment recovery</li>
                </ul>
              </div>
              <div className={styles.card}>
                <Zap className={styles.cardIcon} />
                <h3>Landing Pages</h3>
                <p>High-converting, lightning-fast pages for marketing campaigns.</p>
                <ul className={styles.cardFeatures}>
                  <li><CheckCircle2 size={16} /> A/B testing ready</li>
                  <li><CheckCircle2 size={16} /> Analytics integration</li>
                  <li><CheckCircle2 size={16} /> Fast loading speeds</li>
                </ul>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricingSection} id="pricing">
          <AnimateOnScroll direction="up">
            <h2 className={styles.sectionTitle}>Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>Simple, predictable pricing with no hidden fees.</p>
            <PricingTiers tiers={[
              {
                id: "web-basic",
                title: "Basic Web Security",
                priceNgn: 250000,
                description: "One page website with custom security alone.",
                features: [
                  "1-Page Custom Design",
                  "Custom Security Hardening",
                  "Mobile Responsive",
                  "Fast Loading Speeds"
                ]
              },
              {
                id: "web-dynamic",
                title: "Dynamic One Page",
                priceNgn: 350000,
                description: "One page website dynamic.",
                features: [
                  "Dynamic 1-Page Design",
                  "Custom Security Hardening",
                  "Mobile Responsive",
                  "Basic Interactivity"
                ]
              },
              {
                id: "web-business",
                title: "Standard Business Site",
                priceNgn: 400000,
                description: "One to three page website, with WhatsApp CRM, SEO, and custom security for frontend.",
                features: [
                  "1 to 3 Pages Custom Frontend",
                  "WhatsApp CRM Integration",
                  "On-Page SEO Optimization",
                  "Custom Security Hardening"
                ],
                isPopular: true
              },
              {
                id: "web-ecommerce",
                title: "Premium Fullstack Site",
                priceNgn: 700000,
                description: "Dynamic website with database and backend for blogs, etc.",
                features: [
                  "Dynamic Backend & Database",
                  "Custom Blog / CMS Integration",
                  "Advanced Security & Auth",
                  "WhatsApp CRM & Full SEO"
                ]
              }
            ]} />
          </AnimateOnScroll>
        </section>

        {/* Tech Stack */}
        <section className={styles.techStackSection}>
          <AnimateOnScroll direction="up">
            <h2 className={styles.sectionTitle}>Our Tech Stack</h2>
            <div className={styles.chipsContainer}>
              <span className={styles.chip}>Next.js</span>
              <span className={styles.chip}>React</span>
              <span className={styles.chip}>TypeScript</span>
              <span className={styles.chip}>Node.js</span>
              <span className={styles.chip}>Supabase</span>
              <span className={styles.chip}>PostgreSQL</span>
              <span className={styles.chip}>Vercel</span>
              <span className={styles.chip}>Tailwind</span>
            </div>
          </AnimateOnScroll>
        </section>

        {/* Why Security-First */}
        <section className={styles.securitySection}>
          <AnimateOnScroll direction="fade">
            <h2 className={styles.sectionTitle}>Why Security-First?</h2>
            <p className={styles.securityIntro}>
              Our cybersecurity background means security is built into your website from day 1, not bolted on as an afterthought.
            </p>
            <div className={styles.securityPoints}>
              <div className={styles.securityPoint}>
                <Shield className={styles.securityIcon} />
                <h4>SSL & HTTPS by default</h4>
                <p>Ensuring encrypted data transfer for user trust and better SEO rankings.</p>
              </div>
              <div className={styles.securityPoint}>
                <Code className={styles.securityIcon} />
                <h4>Input Validation & XSS Protection</h4>
                <p>Sanitizing all user inputs to prevent malicious script injections.</p>
              </div>
              <div className={styles.securityPoint}>
                <CheckCircle2 className={styles.securityIcon} />
                <h4>Security Headers & CSP</h4>
                <p>Implementing Content Security Policies and modern security headers.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* Case Studies / See Our Work */}
        <section className={styles.processSection} style={{ background: '#f8fafc', padding: '4rem 5%', textAlign: 'center' }}>
          <AnimateOnScroll direction="up">
            <h2 className={styles.sectionTitle} style={{ color: '#0f172a' }}>See Our Security-First Work</h2>
            <p className={styles.sectionSubtitle} style={{ color: '#475569', marginBottom: '2rem' }}>
              Explore how we've helped organizations build secure, high-performance web applications.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <Link href="/portfolio/cyberoutreach-agent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '1rem 1.5rem', borderRadius: '12px', color: '#0f172a', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Globe size={18} color="#3b82f6" /> CyberOutreach Platform
              </Link>
              <Link href="/portfolio/elitech-admin-bot" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '1rem 1.5rem', borderRadius: '12px', color: '#0f172a', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Code size={18} color="#10b981" /> Elitech Admin System
              </Link>
              <Link href="/portfolio/rusty-threads-bot" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '1rem 1.5rem', borderRadius: '12px', color: '#0f172a', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Zap size={18} color="#f59e0b" /> Rusty Threads Bot
              </Link>
            </div>
            <Link href="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
              View all case studies <ArrowRight size={16} />
            </Link>
          </AnimateOnScroll>
        </section>

        {/* Our Process */}
        <section className={styles.processSection}>
          <AnimateOnScroll direction="up">
            <h2 className={styles.sectionTitle}>Our Process</h2>
            <div className={styles.processSteps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h4>Discovery & Requirements</h4>
                <p>We analyze your needs and outline a strategic roadmap.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h4>Design & Prototype</h4>
                <p>Creating wireframes and UI/UX designs for your approval.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h4>Build & Test</h4>
                <p>Developing the solution with rigorous quality assurance.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <h4>Launch & SEO</h4>
                <p>Deploying the website and optimizing for search engines.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <AnimateOnScroll direction="fade">
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqContainer}>
              <details className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  How much does website development cost in Nigeria?
                  <ChevronDown className={styles.faqIcon} />
                </summary>
                <p className={styles.faqContent}>
                  The cost of website development varies depending on the complexity, features, and requirements of your project. We offer customized solutions tailored to your budget and business goals. Contact us for a free quote.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  How long to build a website?
                  <ChevronDown className={styles.faqIcon} />
                </summary>
                <p className={styles.faqContent}>
                  A standard business website typically takes 2-4 weeks from discovery to launch. Complex web applications or ecommerce platforms may take 6-12 weeks depending on the scope.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  Do you build ecommerce sites?
                  <ChevronDown className={styles.faqIcon} />
                </summary>
                <p className={styles.faqContent}>
                  Yes, we build robust, secure, and scalable ecommerce websites that provide excellent user experiences and integrate seamlessly with local and international payment gateways.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  Is the website SEO optimised?
                  <ChevronDown className={styles.faqIcon} />
                </summary>
                <p className={styles.faqContent}>
                  Absolutely. We build all our websites with technical SEO best practices in mind from day one, ensuring your site is fast, mobile-friendly, and easily discoverable by search engines.
                </p>
              </details>
            </div>
          </AnimateOnScroll>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <AnimateOnScroll direction="up">
            <h2 className={styles.ctaTitle}>Ready to Build Your Website?</h2>
            <div className={styles.ctaButtons} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/contact" className="premium-button">
                Get a Free Quote <ArrowRight size={20} />
              </Link>
              <Link href="/portfolio" className="premium-button-outline">
                View Our Portfolio
              </Link>
            </div>
          </AnimateOnScroll>
        </section>
      </div>
    </PageLayout>
  );
}
