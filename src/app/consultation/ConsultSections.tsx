import Image from 'next/image';
import type { ReactNode } from 'react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { CheckCircle, Plus, Quote, XCircle } from '@/components/icons';
import styles from './consultation.module.css';

type Fact = { icon: ReactNode; text: string };

export function ConsultHero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  facts,
  quote,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  facts: Fact[];
  quote: string;
}) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <AnimateOnScroll direction="fade">
          <span className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroLead}>{lead}</p>
          <div className={styles.heroActions}>
            <a href={primary.href} className={styles.btnPrimary}>{primary.label}</a>
            <a href={secondary.href} className={styles.btnGhost}>{secondary.label}</a>
          </div>
          <ul className={styles.facts}>
            {facts.map((f) => (
              <li key={f.text}>
                {f.icon}
                {f.text}
              </li>
            ))}
          </ul>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right" delay={150}>
          <figure className={styles.mentorCard}>
            <div className={styles.mentorPhoto}>
              <Image
                src="/assets/images/official pic.png"
                alt="Elijah Adeyeye, founder and lead instructor at Elitech Hub"
                fill
                priority
                sizes="(max-width: 960px) 90vw, 420px"
                style={{ objectFit: 'cover' }}
              />
              <figcaption className={styles.mentorMeta}>
                <p className={styles.mentorName}>Elijah Adeyeye</p>
                <p className={styles.mentorRole}>Founder &amp; Lead Instructor</p>
              </figcaption>
            </div>
            <blockquote className={styles.mentorQuote}>
              <Quote size={20} aria-hidden="true" />
              {quote}
            </blockquote>
          </figure>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

export function SectionHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <AnimateOnScroll direction="up">
      <div className={styles.sectionHead}>
        <span className={styles.kicker}>{kicker}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {lead && <p className={styles.sectionLead}>{lead}</p>}
      </div>
    </AnimateOnScroll>
  );
}

export function FeatureCards({
  items,
  numbered = false,
}: {
  items: { icon: ReactNode; title: string; text: string }[];
  numbered?: boolean;
}) {
  return (
    <div className={styles.cards}>
      {items.map((item, i) => (
        <AnimateOnScroll key={item.title} direction="up" delay={i * 100}>
          <article className={styles.card} style={{ height: '100%' }}>
            {numbered && <span className={styles.cardNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>}
            <span className={styles.cardIcon}>{item.icon}</span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardText}>{item.text}</p>
          </article>
        </AnimateOnScroll>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: { title: string; text: ReactNode }[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((s, i) => (
        <li key={s.title} className={styles.step}>
          <AnimateOnScroll direction="up" delay={i * 120}>
            <span className={styles.stepDot}>{i + 1}</span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <div className={styles.stepText}>{s.text}</div>
          </AnimateOnScroll>
        </li>
      ))}
    </ol>
  );
}

export function Compare({
  yesTitle,
  yes,
  noTitle,
  no,
}: {
  yesTitle: string;
  yes: string[];
  noTitle: string;
  no: string[];
}) {
  return (
    <div className={styles.compare}>
      <AnimateOnScroll direction="up">
        <div className={styles.compareCol} style={{ height: '100%' }}>
          <h3 className={styles.compareTitle}>{yesTitle}</h3>
          <ul className={`${styles.compareList} ${styles.yes}`}>
            {yes.map((t) => (
              <li key={t}><CheckCircle size={20} aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll direction="up" delay={120}>
        <div className={`${styles.compareCol} ${styles.compareColNo}`} style={{ height: '100%' }}>
          <h3 className={styles.compareTitle}>{noTitle}</h3>
          <ul className={`${styles.compareList} ${styles.no}`}>
            {no.map((t) => (
              <li key={t}><XCircle size={20} aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className={styles.faq}>
      {items.map((item) => (
        <details key={item.q} className={styles.faqItem}>
          <summary>
            {item.q}
            <Plus size={20} aria-hidden="true" />
          </summary>
          <p className={styles.faqAnswer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FinalCta({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <AnimateOnScroll direction="up">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>{title}</h2>
            <p className={styles.ctaText}>{text}</p>
            <a href={href} className={styles.btnPrimary}>{label}</a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

/** FAQPage schema built from the same questions shown on the page. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
