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
            <article key={paper.id} className={styles.researchCard}>
              <div className={styles.cardImage} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <span className={styles.cardIcon}>📄</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTags}>
                  <span className={styles.tag} style={{ background: '#D1FAE5', color: '#008751' }}>Published</span>
                  <span className={styles.tag} style={{ background: '#DBEAFE', color: '#0ea5e9' }}>{paper.category}</span>
                </div>
                <h3 className={styles.cardTitle}>{paper.title}</h3>
                
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  {paper.authors && Array.isArray(paper.authors) && paper.authors.length > 0 
                    ? paper.authors.map((a: any) => a.name).join(', ')
                    : paper.author || 'Elitech Research Labs'}
                </p>

                <p className={styles.cardDesc} style={{ flex: 1 }}>
                  {paper.abstract ? (paper.abstract.length > 150 ? paper.abstract.substring(0, 150) + '...' : paper.abstract) : 'No abstract available.'}
                </p>

                <div className={styles.cardFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(paper.created_at).getFullYear()}
                    </span>
                    {paper.citations_count !== undefined && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} /> {paper.citations_count} citations
                      </span>
                    )}
                  </div>
                  <Link href={`/research/${paper.slug}`} className={styles.cardLink}>Read Paper →</Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
