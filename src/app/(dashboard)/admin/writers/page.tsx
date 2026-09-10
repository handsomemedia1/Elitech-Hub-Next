"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PenTool, Search, TrendingUp, Check, X, Trash2, Plus } from 'lucide-react';
import styles from '../users/users.module.css';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem',
  background: '#0f172a', border: '1px solid #334155',
  borderRadius: '6px', color: '#f1f5f9', fontSize: '0.9rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.35rem',
  fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8',
};
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
};
const modalStyle: React.CSSProperties = {
  background: '#1e293b', borderRadius: '12px', width: '100%',
  maxWidth: '480px', padding: '2rem', border: '1px solid #334155',
};

export default function AdminWriters() {
  const [writers, setWriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', bio: '', active: true });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchWriters();
  }, []);

  async function fetchWriters() {
    setLoading(true);
    const { data } = await supabase
      .from('writers')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: posts } = await supabase.from('blog_posts').select('author');

    let finalWriters = data || [];
    if (posts) {
      const uniqueAuthors = Array.from(new Set(posts.map((p: any) => p.author).filter((a: any) => a)));
      uniqueAuthors.forEach((author: any) => {
        if (!finalWriters.some((w: any) => w.name === author)) {
          finalWriters.push({
            id: author, name: author, email: 'Legacy Author',
            posts_count: posts.filter((p: any) => p.author === author).length,
            active: true,
          });
        }
      });
    }
    setWriters(finalWriters);
    setLoading(false);
  }

  const openAddModal = () => {
    setForm({ name: '', email: '', bio: '', active: true });
    setFormError('');
    setShowModal(true);
  };

  const handleAddWriter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    const { error } = await supabase.from('writers').insert([{
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim() || null,
      active: form.active,
    }]);
    setSaving(false);
    if (error) {
      setFormError(error.message);
    } else {
      setShowModal(false);
      fetchWriters();
    }
  };

  const handleDeleteWriter = async (id: string, name: string) => {
    if (!window.confirm(`Delete writer: ${name}?`)) return;
    setWriters(writers.filter(w => w.id !== id && w.name !== name));
    if (id && id !== name) {
      await supabase.from('writers').delete().eq('id', id);
    }
  };

  const handleToggleBan = async (id: string, name: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} writer: ${name}?`)) return;
    setWriters(writers.map(w => w.id === id ? { ...w, banned: !currentlyBanned } : w));
    if (id && id !== name) {
      await supabase.from('writers').update({ banned: !currentlyBanned }).eq('id', id);
    }
  };

  const filtered = writers.filter(w =>
    !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Writers Management</h1>
          <p className={styles.subtitle}>Manage blog contributors and authors</p>
        </div>
        <button className={styles.primaryBtn} onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add New Writer
        </button>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name or email..." className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Author</th>
              <th>Email</th>
              <th>Total Posts</th>
              <th>Total Views</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading writers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No writers found.</td></tr>
            ) : filtered.map(writer => (
              <tr key={writer.id}>
                <td className={styles.tdName}>
                  <div className={styles.avatar}>{writer.name ? writer.name.charAt(0) : '?'}</div>
                  {writer.name || 'Unknown'}
                </td>
                <td>{writer.email}</td>
                <td><span className={styles.badge}>{writer.posts_count || 0} Posts</span></td>
                <td style={{ color: '#059669', fontWeight: 500 }}>
                  <TrendingUp size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  {writer.total_views || 0}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${writer.banned ? styles.statusInactive : (writer.active ? styles.statusActive : styles.statusInactive)}`}>
                    {writer.banned ? 'Banned' : (writer.active ? 'Active' : 'Pending')}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} title={writer.banned ? 'Unban Writer' : 'Ban Writer'} onClick={() => handleToggleBan(writer.id, writer.name, writer.banned)}>
                      {writer.banned ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: '#ef4444' }} />}
                    </button>
                    <button className={styles.iconBtn} title="Delete" onClick={() => handleDeleteWriter(writer.id, writer.name)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Writer Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '2rem 1rem 4rem', overflowY: 'auto',
        }}>
          <div style={{ ...modalStyle, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>
                <PenTool size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom', color: '#3b82f6' }} />
                Add New Writer
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddWriter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Elijah Adeyeye" required />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="writer@example.com" required />
              </div>
              <div>
                <label style={labelStyle}>Short Bio</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A brief bio for the author profile..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="active-toggle" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: '1rem', height: '1rem', accentColor: '#3b82f6' }} />
                <label htmlFor="active-toggle" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Mark as Active Writer</label>
              </div>
              {formError && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {formError}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.65rem 1.25rem', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Adding...' : 'Add Writer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}