"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWriterDashboardAction } from './actions';
import { PenTool, FileText, Eye, TrendingUp, PlusCircle } from 'lucide-react';
import styles from './writer.module.css';

export default function WriterOverview() {
  const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, totalViews: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const res = await getWriterDashboardAction();
      if (res.error) {
        console.error(res.error);
      } else {
        setStats(res.stats || { totalPosts: 0, publishedPosts: 0, totalViews: 0, draftPosts: 0 });
        setRecentPosts(res.recentPosts || []);
        setProfile(res.profile || null);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1>Writer Dashboard</h1>
          <p>Welcome back! Here's how your articles are performing.</p>
        </div>
        <Link href="/writer/editor" className={styles.primaryBtn}>
          <PenTool size={18} />
          <span>Write New Article</span>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FileText size={24} />
          </div>
          <div className={styles.statInfo}>
            <p>Total Articles</p>
            <h3>{loading ? '-' : stats.totalPosts}</h3>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Eye size={24} />
          </div>
          <div className={styles.statInfo}>
            <p>Total Views</p>
            <h3>{loading ? '-' : stats.totalViews.toLocaleString()}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <p>Published</p>
            <h3>{loading ? '-' : stats.publishedPosts}</h3>
          </div>
        </div>
      </div>

      {!loading && profile && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Public Author Profile Card */}
          <div style={{ padding: '1.5rem', background: 'var(--color-bg-panel)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🌐 Your Public Author Profile
            </h2>
            {profile.slug ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Public URL:</span>
                  <a
                    href={`/authors/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#00ff41', fontFamily: 'monospace', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}
                  >
                    elitechub.com/authors/{profile.slug}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={`/authors/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    View Public Profile →
                  </a>
                  <Link href="/writer/settings" style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Edit Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Your public author profile hasn&apos;t been set up yet. Add a display name and save your profile to get a public URL.
                </p>
                <Link href="/writer/settings" style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', width: 'fit-content' }}>
                  Set Up Author Profile →
                </Link>
              </div>
            )}
          </div>

          {/* Badges Card */}
          <div style={{ padding: '1.5rem', background: 'var(--color-bg-panel)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏆 Earned Badges
              </h2>
              <Link href="/writer/badges" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.4rem 0.9rem', background: 'rgba(255, 215, 0, 0.1)', color: '#ca8a04', borderRadius: '999px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #fef08a' }}>
                Level: {profile.level || 'Newcomer'}
              </div>
            </div>
            {profile.badges && profile.badges.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.badges.slice(0, 4).map((badge: string, idx: number) => (
                  <span key={idx} style={{ padding: '0.4rem 0.8rem', background: 'var(--color-bg-alt)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏆 {badge}
                  </span>
                ))}
                {profile.badges.length > 4 && (
                  <Link href="/writer/badges" style={{ padding: '0.4rem 0.8rem', background: 'transparent', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-accent)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                    +{profile.badges.length - 4} more
                  </Link>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                No badges yet. Publish your first article to start earning! 🚀
              </p>
            )}
          </div>
        </div>
      )}


      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Articles</h2>
          <Link href="/writer/posts" className={styles.viewAllBtn}>View All</Link>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading articles...</div>
        ) : recentPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <h3>No articles yet</h3>
            <p>You haven't written any articles. Start sharing your knowledge!</p>
            <Link href="/writer/editor" className={styles.outlineBtn}>
              <PlusCircle size={18} />
              <span>Create First Article</span>
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map(post => (
                  <tr key={post.id}>
                    <td className={styles.titleCell}>{post.title}</td>
                    <td>
                      <span className={`${styles.badge} ${post.status === 'published' ? styles.badgeSuccess : post.status === 'pending' ? styles.badgeWarning : styles.badgeDraft}`}>
                        {post.status === 'published' ? 'Published' : post.status === 'pending' ? 'Pending' : 'Draft'}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/writer/editor?id=${post.id}`} className={styles.editLink}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


