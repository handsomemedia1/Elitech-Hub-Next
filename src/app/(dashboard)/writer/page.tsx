"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PenTool, FileText, Eye, TrendingUp, PlusCircle } from 'lucide-react';
import styles from './writer.module.css';

export default function WriterOverview() {
  const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, totalViews: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // In a real app, we'd fetch based on the logged-in writer's ID.
      // For this UI scaffolding, we'll fetch general blog stats.
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (posts) {
        const published = posts.filter(p => p.published).length;
        // Mock views for now since the DB might not track per-post views yet
        const views = published * 1250; 

        setStats({
          totalPosts: posts.length,
          publishedPosts: published,
          totalViews: views
        });
        setRecentPosts(posts.slice(0, 5));
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
                      <span className={`${styles.badge} ${post.published ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {post.published ? 'Published' : 'Draft'}
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
