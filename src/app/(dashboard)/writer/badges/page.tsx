'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWriterDashboardAction } from '../actions';

/** Maps the badge name to an icon + description for the dedicated badges page */
const BADGE_META: Record<string, { icon: string; description: string }> = {
  'First Article': {
    icon: '✍️',
    description: 'Published your first article on Elitech Hub.',
  },
  'Prolific Writer (5+)': {
    icon: '📚',
    description: 'Published 5 or more articles on Elitech Hub.',
  },
  'Expert Writer (10+)': {
    icon: '🏅',
    description: 'Published 10 or more articles. You\'re on a roll!',
  },
  'Master Scribe (50+)': {
    icon: '🎓',
    description: 'Published 50 or more articles. A true knowledge contributor.',
  },
  'Legend (100+)': {
    icon: '🌟',
    description: 'Published 100 or more articles. An Elitech Hub legend.',
  },
  '100 Views Club': {
    icon: '👀',
    description: 'Your articles have been read more than 100 times.',
  },
  '1K Views Club': {
    icon: '🔥',
    description: 'Your articles have accumulated over 1,000 views.',
  },
  '5K Views Club': {
    icon: '🚀',
    description: 'Your articles have accumulated over 5,000 views.',
  },
  '10K Views Club': {
    icon: '💎',
    description: 'Your articles have accumulated over 10,000 views. Elite status!',
  },
};

function getBadgeMeta(badge: string) {
  return BADGE_META[badge] || { icon: '🏆', description: `Earned the "${badge}" achievement on Elitech Hub.` };
}

export default function WriterBadgesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getWriterDashboardAction();
      if (!res.error) {
        setProfile(res.profile || null);
        setStats(res.stats || null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>
        Loading badges...
      </div>
    );
  }

  const badges: string[] = profile?.badges || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          My Badges &amp; Achievements
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Badges are awarded automatically when you hit milestones. Keep publishing to unlock more!
        </p>
      </div>

      {/* Level + Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ padding: '1.25rem', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ca8a04' }}>{profile?.level || 'Newcomer'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Current Level</div>
        </div>
        <div style={{ padding: '1.25rem', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{badges.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Badges Earned</div>
        </div>
        <div style={{ padding: '1.25rem', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats?.publishedPosts || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Articles Published</div>
        </div>
        <div style={{ padding: '1.25rem', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{(stats?.totalViews || 0).toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Total Views</div>
        </div>
      </div>

      {/* Earned Badges */}
      {badges.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            Earned ({badges.length})
          </h2>
          {badges.map((badge, idx) => {
            const meta = getBadgeMeta(badge);
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'var(--color-bg-panel)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    {badge}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {meta.description}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    padding: '0.3rem 0.7rem',
                    background: 'rgba(0, 255, 65, 0.08)',
                    color: '#00c853',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid rgba(0, 255, 65, 0.2)',
                  }}>
                    ✓ Earned
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          marginBottom: '2.5rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>No badges earned yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Publish your first article to earn the <strong>First Article</strong> badge!
          </p>
          <Link
            href="/writer/editor"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Write Your First Article →
          </Link>
        </div>
      )}

      {/* Upcoming Badges (locked) */}
      <div>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Upcoming Achievements
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(BADGE_META)
            .filter(([name]) => !badges.includes(name))
            .map(([name, meta]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '12px',
                  opacity: 0.6,
                }}
              >
                <div style={{ fontSize: '1.75rem', lineHeight: 1, filter: 'grayscale(1)', flexShrink: 0 }}>{meta.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{meta.description}</div>
                </div>
                <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>
                  Locked
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
