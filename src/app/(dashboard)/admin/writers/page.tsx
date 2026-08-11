"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PenTool, Search, Edit2, Trash2, TrendingUp, Check, X } from 'lucide-react';
import styles from '../users/users.module.css';

export default function AdminWriters() {
  const [writers, setWriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWriters() {
      const { data, error } = await supabase
        .from('writers')
        .select('*')
        .order('created_at', { ascending: false });
        
      const { data: posts } = await supabase.from('blog_posts').select('author');
      
      let finalWriters = data || [];
      
      if (posts) {
        const uniqueAuthors = Array.from(new Set(posts.map(p => p.author).filter(a => a)));
        uniqueAuthors.forEach(author => {
          if (!finalWriters.some(w => w.name === author)) {
            finalWriters.push({ 
              id: author, 
              name: author, 
              email: 'Legacy Author', 
              posts_count: posts.filter(p => p.author === author).length, 
              active: true 
            });
          }
        });
      }
      
      setWriters(finalWriters);
      setLoading(false);
    }
    fetchWriters();
    
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  const handleDeleteWriter = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete writer: ${name}?`)) return;
    
    // Optimistic UI update
    setWriters(writers.filter(w => w.id !== id && w.name !== name));
    
    // Try to delete from supabase if it has a real UUID
    if (id && id !== name) {
      await supabase.from('writers').delete().eq('id', id);
    }
  };

  const handleToggleBan = async (id: string, name: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} writer: ${name}?`)) return;

    setWriters(writers.map(w => w.id === id ? { ...w, banned: !currentlyBanned } : w));

    if (id && id !== name) {
      await supabase.from('writers').update({ banned: !currentlyBanned }).eq('id', id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Writers Management</h1>
          <p className={styles.subtitle}>Manage blog contributors and authors</p>
        </div>
        <button className={styles.primaryBtn}>
          <PenTool size={18} /> Add New Writer
        </button>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name or email..." className={styles.searchInput} />
        </div>
        <select className={styles.filterSelect}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending Review</option>
        </select>
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
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading writers...</td>
              </tr>
            ) : writers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No writers found.</td>
              </tr>
            ) : writers.map(writer => (
              <tr key={writer.id}>
                <td className={styles.tdName}>
                  <div className={styles.avatar}>{writer.name ? writer.name.charAt(0) : '?'}</div>
                  {writer.name || 'Unknown'}
                </td>
                <td>{writer.email}</td>
                <td><span className={styles.badge}>{writer.posts_count || 0} Posts</span></td>
                <td style={{ color: '#059669', fontWeight: 500 }}><TrendingUp size={14} style={{marginRight: '4px', verticalAlign: 'text-bottom'}} />{writer.total_views || 0}</td>
                <td>
                  <span className={`${styles.statusBadge} ${writer.banned ? styles.statusInactive : (writer.active ? styles.statusActive : styles.statusInactive)}`}>
                    {writer.banned ? 'Banned' : (writer.active ? 'Active' : 'Pending')}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} title={writer.banned ? "Unban Writer" : "Ban Writer"} onClick={() => handleToggleBan(writer.id, writer.name, writer.banned)}>
                      {writer.banned ? <Check size={16} style={{color: '#10b981'}} /> : <X size={16} style={{color: '#ef4444'}} />}
                    </button>
                    <button className={styles.iconBtn} title="Delete" onClick={() => handleDeleteWriter(writer.id, writer.name)}><Trash2 size={16} /></button>
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