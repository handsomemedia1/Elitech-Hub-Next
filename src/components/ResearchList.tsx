"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, FileText, Download, Clock } from 'lucide-react';
import styles from '@/app/research/research.module.css';

export default function ResearchList() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    async function fetchPapers() {
      const { data, error } = await supabase
        .from('research')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) setPapers(data);
      setLoading(false);
    }
    fetchPapers();
  }, []);

  const filteredPapers = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.abstract && p.abstract.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Information Security', 'Data Science', 'Other'];

  return (
    <>
      <div className={styles.filtersContainer} style={{ marginTop: '2rem' }}>
        <div className={styles.filtersWrapper}>
          <div className={styles.filtersList}>
            {categories.slice(0, 5).map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${styles.filterBtn} ${category === cat ? styles.filterBtnActive : ''}`}
                style={{ cursor: 'pointer' }}
              >
                {cat === 'All' ? 'All Research' : cat}
              </button>
            ))}
          </div>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search research papers, topics, keywords..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.researchGrid} style={{ marginTop: '2rem', minHeight: '300px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            <div className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
            <p>Loading repository...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No papers found</h3>
            <p>Try adjusting your search criteria or browse another category.</p>
          </div>
        ) : (
          filteredPapers.map(paper => (
            <article key={paper.id} className={styles.researchCard} style={{ display: 'flex', flexDirection: 'column', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ padding: '2rem' }}>
                <div className={styles.cardTags} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Published</span>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{paper.category}</span>
                  {paper.type === 'pdf' && (
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={10} /> PDF</span>
                  )}
                </div>
                
                <h3 className={styles.cardTitle} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', lineHeight: 1.4 }}>
                  <Link href={`/research/${paper.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {paper.title}
                  </Link>
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    EH
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                    {paper.authors && Array.isArray(paper.authors) && paper.authors.length > 0 
                      ? paper.authors.map((a: any) => a.name).join(', ')
                      : paper.author || 'Elitech Research Labs'}
                  </p>
                </div>

                <p className={styles.cardDesc} style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, flex: 1, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {paper.abstract || 'The full abstract is available within the research paper document. Click through to read the comprehensive analysis, methodology, and findings.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1.25rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {new Date(paper.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {paper.citations_count !== undefined && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} /> {paper.citations_count} Citations
                    </span>
                  )}
                </div>
                <Link href={`/research/${paper.slug}`} style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                  Read Paper <span style={{ transition: 'transform 0.2s' }}>→</span>
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
