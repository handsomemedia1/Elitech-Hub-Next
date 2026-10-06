"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { PenTool, Search, TrendingUp, Check, X, Trash2, Plus, Ban, CheckCircle, Clock } from 'lucide-react';
import styles from '../users/users.module.css';
import AdminModal from '@/components/AdminModal';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem',
  background: '#0f172a', border: '1px solid #334155',
  borderRadius: '6px', color: '#f1f5f9', fontSize: '0.9rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.35rem',
  fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8',
};
const modalStyle: React.CSSProperties = {
  background: '#1e293b', borderRadius: '12px', width: '100%',
  maxWidth: '480px', padding: '2rem', border: '1px solid #334155',
};

import WriterDetailPanel from './WriterDetailPanel';
import { fetchWritersAction, addWriterAction, deleteWriterAction, updateWriterStatusAction } from './actions';

export default function AdminWriters() {
  const [writers, setWriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedWriter, setSelectedWriter] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', bio: '', status: 'approved' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchWriters();
  }, []);

  async function fetchWriters() {
    setLoading(true);
    const { data, error } = await fetchWritersAction();
    if (error) {
      console.error("Error fetching writers", error);
      alert(error);
    } else {
      setWriters(data || []);
    }
    setLoading(false);
  }

  const openAddModal = () => {
    setForm({ name: '', email: '', bio: '', status: 'approved' });
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
    
    const writerData = {
      name: form.name.trim(),
      display_name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim() || null,
      status: form.status,
      password_hash: 'temp' // A dummy hash, they can reset it
    };

    const { success, error } = await addWriterAction(writerData);
    setSaving(false);
    
    if (!success) {
      setFormError(error || 'Failed to add writer');
    } else {
      setShowModal(false);
      fetchWriters();
    }
  };

  const handleDeleteWriter = async (id: string, name: string) => {
    if (!window.confirm(`Delete writer: ${name}?`)) return;
    
    // Optimistic update
    setWriters(writers.filter(w => w.id !== id));
    
    const { success, error } = await deleteWriterAction(id);
    if (!success) {
      alert(`Error deleting writer: ${error}`);
      fetchWriters(); // Revert on failure
    }
  };

  const handleUpdateStatus = async (id: string, name: string, newStatus: string) => {
    if (!window.confirm(`Change status to ${newStatus.toUpperCase()} for writer: ${name}?`)) return;
    
    // Optimistic update
    setWriters(writers.map(w => w.id === id ? { ...w, status: newStatus } : w));
    
    const { success, error } = await updateWriterStatusAction(id, newStatus);
    if (!success) {
      alert(`Error updating status: ${error}`);
      fetchWriters(); // Revert on failure
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading writers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No writers found.</td></tr>
            ) : filtered.map(writer => (
              <tr key={writer.id}>
                <td className={styles.tdName}>
                  <div className={styles.avatar}>{writer.name ? writer.name.charAt(0) : '?'}</div>
                  {writer.name || 'Unknown'}
                </td>
                <td>{writer.email}</td>
                <td><span className={styles.badge}>{writer.posts_count || 0} Posts</span></td>
                <td>
                  <span className={`${styles.statusBadge} ${writer.status === 'approved' ? styles.statusActive : writer.status === 'pending' ? styles.statusPending : styles.statusInactive}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {writer.status === 'approved' && <CheckCircle size={12} />}
                    {writer.status === 'pending' && <Clock size={12} />}
                    {(writer.status === 'rejected' || writer.status === 'suspended') && <Ban size={12} />}
                    {writer.status ? writer.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.primaryBtn} style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", display: "flex", gap: "0.4rem", alignItems: "center" }} onClick={() => setSelectedWriter(writer)}>
                      <TrendingUp size={14} /> Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AdminModal onClose={() => setShowModal(false)}>
          <div style={{ ...modalStyle, margin: '0 auto' }}>
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
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
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
        </AdminModal>
      )}
      {selectedWriter && (
        <WriterDetailPanel 
          writer={selectedWriter} 
          onClose={() => setSelectedWriter(null)} 
          onDelete={(id, name) => { handleDeleteWriter(id, name); setSelectedWriter(null); }} 
          onSuspend={(id, name) => { handleUpdateStatus(id, name, "suspended"); setSelectedWriter(null); }} 
          onApprove={(id, name) => { handleUpdateStatus(id, name, "approved"); setSelectedWriter(null); }}
        />
      )}
    </div>
  );
}

