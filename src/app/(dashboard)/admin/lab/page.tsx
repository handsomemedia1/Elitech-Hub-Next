"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FlaskConical, Search, FileText, Edit2, Trash2, ExternalLink } from 'lucide-react';
import styles from '../users/users.module.css';

export default function AdminLab() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchResearch() {
      const { data, error } = await supabase.from('research').select('*').order('created_at', { ascending: false });
      if (data) setPapers(data);
      setLoading(false);
    }
    fetchResearch();
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    // Optimistic UI update
    setPapers(papers.filter(p => p.id !== id));
    
    // Try to delete from supabase
    await supabase.from('research').delete().eq('id', id);
  };

  // Advanced upload moved to dedicated page

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Research Lab</h1>
          <p className={styles.subtitle}>Manage research papers, whitepapers, and lab resources</p>
        </div>
        <div>
          <Link href="/admin/lab/upload" className={styles.primaryBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={18} /> Upload New Paper
          </Link>
        </div>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search publications..." className={styles.searchInput} />
        </div>
        <select className={styles.filterSelect}>
          <option value="all">All Types</option>
          <option value="paper">Research Paper</option>
          <option value="whitepaper">Whitepaper</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Lead Author</th>
              <th>Type</th>
              <th>Publication Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Loading papers...</td></tr>
            ) : papers.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No research papers uploaded yet.</td></tr>
            ) : papers.map(paper => (
              <tr key={paper.id}>
                <td className={styles.tdName}>
                  <div className={styles.avatar} style={{ background: '#3b82f6' }}><FileText size={16} /></div>
                  <span style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{paper.title}</span>
                </td>
                <td>{paper.author || 'Admin'}</td>
                <td><span className={styles.badge}>{paper.type}</span></td>
                <td>{new Date(paper.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${paper.published ? styles.statusActive : styles.statusInactive}`}>
                    {paper.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href={`/research/${paper.slug}`} target="_blank" className={styles.iconBtn} title="View"><ExternalLink size={16} /></Link>
                    <button className={styles.iconBtn} title="Edit" onClick={() => alert("Edit functionality coming soon. For now, please delete and re-upload.")}><Edit2 size={16} /></button>
                    <button className={styles.iconBtn} title="Delete" onClick={() => handleDelete(paper.id, paper.title)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}