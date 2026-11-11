import Link from 'next/link';
import { ArrowRight, Compass, Laptop, Target } from '@/components/icons';
import styles from './nextStep.module.css';

type Post = { title?: string | null; slug?: string | null; category?: string | null; tags?: string[] | null };

/**
 * A single, topic-aware next step shown right after the article body.
 * Most visitors arrive on one article from Google; giving them one clear,
 * relevant place to go next keeps them on the site.
 */
function pick(post: Post) {
  const text = [post.title, post.slug, post.category, ...(post.tags || [])].join(' ').toLowerCase();

  if (/laptop|\bram\b|virtuali|hardware|\bspecs?\b/.test(text)) {
    return {
      icon: <Laptop size={28} />,
      kicker: 'Next step',
      title: 'Find a laptop that can handle your labs',
      text: 'See the machines we recommend for cybersecurity students in Nigeria, with prices and the specs that matter.',
      primary: { href: '/laptops', label: 'Browse recommended laptops' },
      secondary: { href: '/blog/how-much-ram-do-i-need-for-cybersecurity', label: 'How much RAM do I need?' },
    };
  }

  if (/career|job|degree|certif|portfolio|experience|upskill|beginner|background|path/.test(text)) {
    return {
      icon: <Target size={28} />,
      kicker: 'Not sure where you fit?',
      title: 'Get an honest view of your path into cybersecurity',
      text: 'Take the free Before Cybersecurity assessment, or book a one-to-one session for a roadmap built around your background.',
      primary: { href: '/before-cybersecurity', label: 'Take the assessment' },
      secondary: { href: '/consultation', label: 'Book a consultation' },
    };
  }

  return {
    icon: <Compass size={28} />,
    kicker: 'Keep learning',
    title: 'Turn reading into real skills',
    text: 'Our live, hands-on programmes take you from the ideas in articles like this to practical security work.',
    primary: { href: '/programs', label: 'Explore programmes' },
    secondary: { href: '/before-cybersecurity', label: 'Start with the free assessment' },
  };
}

export function ArticleNextStep({ post }: { post: Post }) {
  const s = pick(post);
  return (
    <aside className={styles.box} aria-label="Suggested next step">
      <span className={styles.icon}>{s.icon}</span>
      <div className={styles.body}>
        <span className={styles.kicker}>{s.kicker}</span>
        <h2 className={styles.title}>{s.title}</h2>
        <p className={styles.text}>{s.text}</p>
        <div className={styles.actions}>
          <Link href={s.primary.href} className={styles.primary}>
            {s.primary.label} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href={s.secondary.href} className={styles.secondary}>
            {s.secondary.label}
          </Link>
        </div>
      </div>
    </aside>
  );
}
