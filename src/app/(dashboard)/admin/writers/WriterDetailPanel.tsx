'use client';
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Ban, Trash2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WriterDetailPanel({ writer, onClose, onDelete, onSuspend, onApprove }: any) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('writer_productivity_settings').select('*').eq('writer_id', writer.id).single();
      if (data) {
        // Parse preferred_days if it's a PG string array
        let parsedDays = data.preferred_days || [];
        if (typeof parsedDays === 'string') {
          parsedDays = parsedDays.replace(/^{|}$/g, '').split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        setSettings({ ...data, preferred_days: parsedDays });
      }
      setLoading(false);
    }
    load();
  }, [writer.id]);

  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh',
    background: '#0f172a', borderLeft: '1px solid #334155',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', flexDirection: 'column', color: '#f1f5f9',
    transition: 'transform 0.3s ease',
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{writer.name || 'Unknown'}</h2>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{writer.email}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#3b82f6" /> Availability & Schedule
            </h3>
            {loading ? (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading availability...</div>
            ) : settings ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <table style={{ width: '100%', fontSize: '0.9rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Day</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Available</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_OF_WEEK.map(day => {
                      const isAvailable = settings.preferred_days?.includes(day);
                      return (
                        <tr key={day} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>{day}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isAvailable ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Yes</span> : <span style={{ color: '#64748b' }}>No</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: isAvailable ? '#f1f5f9' : '#64748b' }}>
                            {isAvailable ? `${settings.reminder_time?.substring(0,5)} (${settings.timezone})` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
                Writer has not configured their availability.
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={`/admin/writers/${writer.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px', color: '#f1f5f9', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>
                <TrendingUp size={18} color="#3b82f6" /> View Full Productivity Dashboard
              </a>
              
              {writer.status === 'approved' && (
                <button onClick={() => onSuspend(writer.id, writer.name)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                  <Ban size={18} /> Suspend Writer
                </button>
              )}
              {writer.status !== 'approved' && (
                <button onClick={() => onApprove(writer.id, writer.name)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                  <CheckCircle2 size={18} /> Approve / Reactivate
                </button>
              )}
              <button onClick={() => onDelete(writer.id, writer.name)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                <Trash2 size={18} /> Deactivate & Delete
              </button>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
              Note: Deleting a writer performs a safe soft-delete. Historical articles and authorship will remain intact.
            </p>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #334155' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '0.85rem', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Close Panel
          </button>
        </div>
      </div>
    </>
  );
}
