'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Folder, LayoutGrid, BookOpen, X, ChevronRight } from 'lucide-react';
import { getClustersAction, createClusterAction } from './actions';
import styles from '../writer.module.css';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PLANNED:   { bg: '#1f2937', text: '#9ca3af' },
  DRAFT:     { bg: '#1e3a5f', text: '#60a5fa' },
  PUBLISHED: { bg: '#064e3b', text: '#6ee7b7' },
};

export default function ClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getClustersAction();
    if (res.data) setClusters(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await createClusterAction(name, description);
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setName('');
      setDescription('');
      load();
    } else {
      alert(res.error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading clusters...</div>;

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1>Content Clusters</h1>
          <p>Organize your articles into topical clusters for stronger SEO and internal linking.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>
          <PlusCircle size={18} />
          <span>New Cluster</span>
        </button>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#f3f4f6', fontWeight: 600, margin: 0 }}>Create New Cluster</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#e5e7eb', fontSize: '0.9rem' }}>Cluster Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Network Security Fundamentals"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #374151', borderRadius: '0.5rem', backgroundColor: '#0d1117', color: '#e5e7eb', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#e5e7eb', fontSize: '0.9rem' }}>Description <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is this cluster about?"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #374151', borderRadius: '0.5rem', backgroundColor: '#0d1117', color: '#e5e7eb', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #374151', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className={styles.primaryBtn}>
                  {creating ? 'Creating...' : 'Create Cluster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {clusters.length === 0 ? (
        /* Empty State */
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          backgroundColor: '#111827', borderRadius: '0.75rem',
          border: '1px dashed #374151',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Folder size={28} color="#6b7280" />
          </div>
          <h3 style={{ color: '#f3f4f6', marginBottom: '0.5rem' }}>No clusters yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '0.9rem', maxWidth: '340px', margin: '0.5rem auto 1.75rem' }}>
            Group related articles into clusters to boost internal linking and topic authority.
          </p>
          <button onClick={() => setShowModal(true)} className={styles.primaryBtn} style={{ margin: '0 auto' }}>
            <PlusCircle size={16} /> Create Your First Cluster
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {clusters.map(cluster => {
            const articles = cluster.cluster_articles || [];
            const published = articles.filter((a: any) => a.status === 'PUBLISHED').length;
            const pct = articles.length > 0 ? Math.round((published / articles.length) * 100) : 0;

            return (
              <Link href={`/writer/clusters/${cluster.id}`} key={cluster.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem',
                  padding: '1.5rem', height: '100%', cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.15s',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LayoutGrid size={20} color="#c3151c" />
                    </div>
                    <ChevronRight size={18} color="#4b5563" />
                  </div>

                  {/* Name + Description */}
                  <div>
                    <h3 style={{ color: '#f3f4f6', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.4rem' }}>{cluster.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      {cluster.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Article count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.82rem' }}>
                    <BookOpen size={14} />
                    <span>{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.4rem' }}>
                      <span>Published</span>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>{published} / {articles.length}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1f2937', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: '#c3151c', width: `${pct}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
