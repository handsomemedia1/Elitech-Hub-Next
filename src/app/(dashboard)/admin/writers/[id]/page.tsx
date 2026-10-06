'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, CheckCircle2, TrendingUp, BookOpen, PenTool } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from '../../admin.module.css';

export default function AdminWriterDetail({ params }: { params: { id: string } }) {
  const [writer, setWriter] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      
      const { data: w } = await supabase.from('writers').select('*').eq('id', params.id).single();
      setWriter(w);

      if (w) {
        const { data: s } = await supabase.from('writer_productivity_settings').select('*').eq('writer_id', w.id).single();
        setSettings(s);

        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0,0,0,0);

        const { data: a } = await supabase.from('writer_activity_log').select('*').eq('writer_id', w.id).gte('activity_date', startOfWeek.toISOString().split('T')[0]);
        setActivity(a || []);

        const { data: c } = await supabase.from('content_clusters').select('*, cluster_articles(*)').eq('writer_id', w.id);
        setClusters(c || []);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading writer details...</div>;
  if (!writer) return <div style={{ padding: '2rem', color: 'white' }}>Writer not found.</div>;

  const completedDays = new Set(activity.map(a => a.activity_date)).size;
  const isGoalMet = completedDays >= (settings?.weekly_target || 2);

  return (
    <div className={styles.adminWrapper} style={{ color: 'white' }}>
      <Link href="/admin/writers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Writers
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{writer.name}</h1>
        <p style={{ color: '#94a3b8' }}>{writer.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="#3b82f6" /> Schedule & Productivity
          </h2>
          {settings ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><strong style={{ color: '#94a3b8' }}>Weekly Target:</strong> {settings.weekly_target} days</div>
              <div><strong style={{ color: '#94a3b8' }}>Reminder Time:</strong> {settings.reminder_time.substring(0,5)} ({settings.timezone})</div>
              <div><strong style={{ color: '#94a3b8' }}>Preferred Days:</strong> {settings.preferred_days?.join(', ') || 'None'}</div>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#94a3b8' }}>This Week's Activity:</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{completedDays} / {settings.weekly_target}</span>
                  {isGoalMet && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}><CheckCircle2 size={16} /> Goal Met</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#94a3b8' }}>Writer has not configured their productivity settings.</div>
          )}
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#10b981" /> Content Clusters ({clusters.length})
          </h2>
          {clusters.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>No clusters created yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {clusters.map(c => {
                const articles = c.cluster_articles || [];
                const pub = articles.filter((a: any) => a.status === 'PUBLISHED').length;
                return (
                  <div key={c.id} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{articles.length} planned | {pub} published</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
