import React from 'react';
import Link from 'next/link';
import type { ChapterItem } from '@/data/beforeCybersecurityData';
import { PARTS } from '@/data/beforeCybersecurityToc';
import { Lock as IconLock } from '@/components/icons';

export interface LockedChapterViewProps {
  chapter: ChapterItem;
  chapterIndex: number;
  isAuthenticated: boolean;
}

export default function LockedChapterView({
  chapter,
  isAuthenticated,
}: LockedChapterViewProps) {
  const part = PARTS.find((p) => p.number === chapter.partNumber);

  return (
    <article
      style={{
        maxWidth: '820px',
        margin: '0 auto',
        color: '#E4E4E7',
        lineHeight: '1.75',
        fontSize: '1.05rem',
        paddingBottom: '5rem',
      }}
    >
      {/* Top Breadcrumbs */}
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #1E1E24',
          marginBottom: '2.5rem',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#71717A' }}>
          <Link href="/before-cybersecurity/guide" style={{ color: '#8E8E93', textDecoration: 'none' }}>
            Guide Index
          </Link>
          <span>/</span>
          <span style={{ color: '#A1A1AA' }}>Part 0{part?.number}</span>
          <span>/</span>
          <span style={{ color: '#C3151C', fontWeight: 600 }}>Chapter {chapter.number}</span>
        </div>

        <Link
          href="/before-cybersecurity/guide"
          style={{
            color: '#8E8E93',
            fontSize: '0.8rem',
            textDecoration: 'none',
            border: '1px solid #24242A',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
          }}
        >
          ← All Chapters
        </Link>
      </nav>

      {/* Chapter Title & Metadata */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            fontSize: '0.8rem',
            color: '#C3151C',
            fontWeight: 700,
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          PART 0{part?.number} // {part?.title.toUpperCase()}
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          {chapter.title}
        </h1>

        {chapter.subtitle && (
          <div
            style={{
              fontSize: '1.2rem',
              color: '#A1A1AA',
              lineHeight: 1.5,
              marginBottom: '1rem',
            }}
          >
            {chapter.subtitle}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            fontSize: '0.85rem',
            color: '#71717A',
            fontFamily: 'monospace',
            borderTop: '1px solid #1E1E24',
            paddingTop: '0.75rem',
          }}
        >
          <span>CH. 0{chapter.number}</span>
          <span>EST. READ: {chapter.readTimeMinutes} MIN</span>
          <span>TIER: FULL PRODUCT</span>
        </div>
      </header>

      {/* Paywall / Locked Card */}
      <div
        style={{
          backgroundColor: '#0F0F14',
          border: '1px solid #272733',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(195, 21, 28, 0.1)',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(195, 21, 28, 0.15)',
            border: '2px solid #C3151C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.5rem',
          }}
        >
          <IconLock size="1em" className="inline-icon" aria-hidden="true" />
        </div>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(195, 21, 28, 0.12)',
            border: '1px solid rgba(195, 21, 28, 0.3)',
            color: '#FF5A60',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          Premium Chapter
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
          This Chapter is Locked
        </h2>

        <p
          style={{
            color: '#A1A1AA',
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto 1.75rem',
          }}
        >
          Chapter {chapter.number} is part of the full <strong>Before Cybersecurity</strong> interactive system.
          Unlock the complete 29-chapter guide, downloadable PDF edition, diagnostic assessment report, and 90-day actionable roadmap.
        </p>

        {/* Feature Highlights */}
        <div
          style={{
            backgroundColor: '#15151B',
            border: '1px solid #202028',
            borderRadius: '10px',
            padding: '1.25rem',
            maxWidth: '500px',
            margin: '0 auto 2rem',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#C3151C', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Included with Full Experience:
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#D4D4D8' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Complete 29 Chapters with Lab Worksheets
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Standalone PDF Edition for Offline Reading
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> 32-Question Diagnostic &amp; NIST Role Report
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> 30/60/90-Day Deliverable Action Roadmap
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/before-cybersecurity#pricing"
            style={{
              backgroundColor: '#C3151C',
              color: '#FFFFFF',
              padding: '0.85rem 1.75rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(195, 21, 28, 0.3)',
            }}
          >
            Unlock Full System (₦25,000 / $29) →
          </Link>

          {isAuthenticated ? (
            <Link
              href="/before-cybersecurity/account"
              style={{
                backgroundColor: '#1E1E24',
                color: '#D4D4D8',
                border: '1px solid #33333E',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Account Status
            </Link>
          ) : (
            <Link
              href={`/login?redirect=/before-cybersecurity/guide/${chapter.slug}`}
              style={{
                backgroundColor: '#1E1E24',
                color: '#D4D4D8',
                border: '1px solid #33333E',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Already Purchased? Log In
            </Link>
          )}
        </div>
      </div>

      {/* Free Sample Recommendation */}
      <div
        style={{
          borderTop: '1px solid #1E1E24',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#8E8E93',
          fontSize: '0.9rem',
        }}
      >
        <p style={{ margin: '0 0 0.75rem 0' }}>
          Want to sample the book first? Read the free orientation chapters:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/before-cybersecurity/guide/the-map-before-the-journey"
            style={{ color: '#C3151C', textDecoration: 'none', fontWeight: 600 }}
          >
            Chapter 1: The Map Before the Journey →
          </Link>
          <Link
            href="/before-cybersecurity/guide/the-two-types-of-beginners"
            style={{ color: '#C3151C', textDecoration: 'none', fontWeight: 600 }}
          >
            Chapter 2: The Two Types of Beginners →
          </Link>
        </div>
      </div>
    </article>
  );
}
