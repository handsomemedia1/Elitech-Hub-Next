import React from 'react';
import PageLayout from '@/components/PageLayout';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { Star, MessageCircle, Heart } from 'lucide-react';
import Script from 'next/script';
import styles from '../about/about.module.css';

export const metadata = {
  title: 'Testimonials & Reviews | Elitech Hub',
  description: 'See what our students, partners, and clients are saying about Elitech Hub on Trustpilot and Senja. Read our verified testimonials.',
  keywords: [
    'Elitech Hub reviews',
    'Elitech Hub testimonials',
    'Trustpilot Elitech Hub',
    'Senja reviews',
    'Cybersecurity training reviews Nigeria',
    'Web development agency reviews'
  ],
  openGraph: {
    title: 'Testimonials | Elitech Hub',
    description: 'Real feedback from our students and clients.',
    url: 'https://elitechub.com/testimonials',
    siteName: 'Elitech Hub',
    locale: 'en_NG',
    images: [{ url: 'https://elitechub.com/images/og-default.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://elitechub.com/testimonials'
  }
};

export default function TestimonialsPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className={styles.hero} style={{ backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.75) 100%), url('/assets/images/programs-hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <AnimateOnScroll direction="fade" delay={200}>
          <div className={styles.badge}>
            <Heart size={16} style={{ color: '#ef4444' }} />
            <span style={{ marginLeft: '8px' }}>Wall of Love</span>
          </div>
          <h1 className={styles.title}>
            Trusted by <span className="text-gradient-primary">Hundreds</span> of Students, Clients & Partners
          </h1>
          <p className={styles.subtitle} style={{ maxWidth: '700px', margin: '0 auto' }}>
            Don't just take our word for it. Read verified reviews from the interns, volunteers, students, and businesses whose careers and platforms we've helped transform.
          </p>
        </AnimateOnScroll>
      </section>


      {/* Senja Section */}
      <section style={{ padding: '6rem 5%', background: 'var(--color-bg-base)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnimateOnScroll direction="up">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <MessageCircle size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
                Community Wall of Love
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Direct feedback collected from our diverse community via Senja.
              </p>
            </div>
            
            <div style={{ padding: '2rem 0', minHeight: '400px' }}>
              <div className="senja-embed" data-id="HpHOaEvsSoEUJKi6DhZ14HEpdsdJ" data-lazyload="false"></div>
              <Script strategy="lazyOnload" src="https://widget.senja.io/widget/HpHOaEvsSoEUJKi6DhZ14HEpdsdJ/platform.js" />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  );
}
