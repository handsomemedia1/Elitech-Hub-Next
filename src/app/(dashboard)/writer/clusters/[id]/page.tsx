'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, CheckCircle, Clock, FileText, Link as LinkIcon } from 'lucide-react';
import { getClusterAction, addClusterArticleAction, updateClusterArticleStatusAction } from '../actions';
import styles from '../../writer.module.css';

export default function ClusterDetailPage({ params }: { params: { id: string } }) {
  const [cluster, setCluster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await getClusterAction(params.id);
    if (res.data) setCluster(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addClusterArticleAction(params.id, title, description, targetKeyword, 'PLANNED', '');
    if (res.success) {
      setShowModal(false);
      setTitle('');
      setDescription('');
      setTargetKeyword('');
      load();
    } else {
      alert(res.error);
    }
  };

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    let url = undefined;
    if (newStatus === 'PUBLISHED') {
      const pubUrl = prompt("Enter the published URL of this article:");
      if (pubUrl === null) return;
      url = pubUrl;
    }
    const res = await updateClusterArticleStatusAction(articleId, params.id, newStatus, url);
    if (res.success) load();
    else alert(res.error);
  };

  if (loading) return <div className={styles.loading}>Loading cluster details...</div>;
  if (!cluster) return <div className={styles.dashboardWrapper}>Cluster not found.</div>;

  const articles = cluster.cluster_articles || [];
  const published = articles.filter((a: any) => a.status === 'PUBLISHED').length;

  return (
    <div className={styles.dashboardWrapper}>
      <Link href="/writer/clusters" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Clusters
      </Link>

      <div className={styles.header}>
        <div>
          <h1>{cluster.name}</h1>
          <p>{cluster.description}</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>
          <Plus size={18} />
          <span>Add Article</span>
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block' }}>Total Planned</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{articles.length}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block' }}>Published</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{published}</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Progress ({articles.length ? Math.round((published/articles.length)*100) : 0}%)</span>
          <div style={{ width: '100%', backgroundColor: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#c3151c', width: articles.length > 0 ? `${(published / articles.length) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Article Title</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Target Keyword</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No articles planned in this cluster yet.</td></tr>
            ) : (
              articles.map((a: any) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{a.title}</div>
                    {a.description && <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>{a.description}</div>}
                    {a.published_url && (
                      <a href={a.published_url} target="_blank" style={{ fontSize: '0.8rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <LinkIcon size={12} /> {a.published_url}
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.9rem' }}>{a.target_keyword || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold',
                        border: 'none', outline: 'none', cursor: 'pointer',
                        backgroundColor: a.status === 'PUBLISHED' ? '#d1fae5' : (a.status === 'WRITING' ? '#dbeafe' : '#f3f4f6'),
                        color: a.status === 'PUBLISHED' ? '#065f46' : (a.status === 'WRITING' ? '#1e40af' : '#4b5563')
                      }}
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="WRITING">WRITING</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link href={`/writer/editor?cluster=${params.id}&clusterArticleId=${a.id}&title=${encodeURIComponent(a.title)}`} className={styles.secondaryBtn} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      Write
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Planned Article</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Article Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Target Keyword (Optional)</label>
                <input type="text" value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Brief Description / Outline</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white' }}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Add Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
