'use client';

import React, { useEffect, useState } from 'react';
import { Save, Clock, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { getProductivitySettingsAction, saveProductivitySettingsAction, getWeeklyActivityAction } from './actions';
import styles from '../writer.module.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Dark-theme inline style tokens
const dark = {
  card: { backgroundColor: '#1a1f2e', border: '1px solid #2d3748', borderRadius: '0.75rem', padding: '1.5rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #374151', backgroundColor: '#111827', color: '#e5e7eb', outline: 'none' },
  label: { display: 'block' as const, fontWeight: 'bold' as const, marginBottom: '0.5rem', color: '#e5e7eb' },
  subtext: { fontSize: '0.82rem', color: '#6b7280' },
  divider: { borderBottom: '1px solid #2d3748', paddingBottom: '1rem', marginBottom: '1.5rem' },
};

export default function ProductivityPage() {
  const [settings, setSettings] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state — days is the single source of truth for the UI
  const [target, setTarget] = useState(2);
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState('09:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [setRes, actRes] = await Promise.all([getProductivitySettingsAction(), getWeeklyActivityAction()]);
      if (setRes.data) {
        setSettings(setRes.data);
        setTarget(setRes.data.weekly_target);

        // Supabase TEXT[] can come back as a JS array or a Postgres string like "{Monday,Tuesday}"
        const rawDays = setRes.data.preferred_days;
        let parsedDays: string[] = [];
        if (Array.isArray(rawDays)) {
          parsedDays = rawDays;
        } else if (typeof rawDays === 'string' && rawDays.length > 0) {
          parsedDays = rawDays.replace(/^{|}$/g, '').split(',').map(s => s.trim()).filter(Boolean);
        }
        setDays(parsedDays);

        setTime(setRes.data.reminder_time ? setRes.data.reminder_time.substring(0, 5) : '09:00');
        if (setRes.data.timezone) setTimezone(setRes.data.timezone);
      }
      if (actRes.data) setActivity(actRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const toggleDay = (d: string) => {
    setDays(prev => {
      const safe = Array.isArray(prev) ? prev : [];
      return safe.includes(d) ? safe.filter(x => x !== d) : [...safe, d];
    });
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    const res = await saveProductivitySettingsAction({
      weekly_target: target,
      preferred_days: days,
      reminder_time: time + ':00',
      timezone,
    });
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Schedule saved successfully.' });
    }
    setSaving(false);
  };

  if (loading) return <div className={styles.loading}>Loading productivity...</div>;

  const completedDays = new Set(activity.map(a => a.activity_date)).size;
  const isGoalMet = completedDays >= (settings?.weekly_target || 2);

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1>Productivity &amp; Schedule</h1>
          <p>Manage your weekly writing goals and reminders.</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <p>Weekly Goal</p>
            <h3>{settings?.weekly_target || 2} days</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: isGoalMet ? '#064e3b' : '#450a0a', color: isGoalMet ? '#10b981' : '#ef4444' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <p>Completed This Week</p>
            <h3>{completedDays} {completedDays === 1 ? 'day' : 'days'}</h3>
            <span style={{ fontSize: '0.8rem', color: isGoalMet ? '#10b981' : '#6b7280' }}>
              {isGoalMet ? 'Goal Achieved!' : `${(settings?.weekly_target || 2) - completedDays} days remaining`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Configure Schedule Card */}
        <div style={dark.card}>
          <h3 style={{ ...dark.divider, color: '#f3f4f6', fontWeight: 600 }}>Configure Schedule</h3>

          {message.text && (
            <div style={{
              padding: '0.875rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem',
              backgroundColor: message.type === 'error' ? '#450a0a' : '#064e3b',
              color: message.type === 'error' ? '#fca5a5' : '#6ee7b7',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'
            }}>
              <AlertCircle size={16} />
              {message.text}
            </div>
          )}

          <form onSubmit={saveSettings}>
            {/* Weekly Target */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={dark.label}>Weekly Target (Days)</label>
              <select
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                style={dark.input}
              >
                {[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} days</option>)}
              </select>
            </div>

            {/* Preferred Days */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={dark.label}>Preferred Reminder Days</label>
              <p style={{ ...dark.subtext, marginBottom: '0.875rem' }}>
                Days to receive email reminders. Writing on any day counts toward your target.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {DAYS_OF_WEEK.map(d => {
                  const isSelected = days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '2rem',
                        border: '1px solid',
                        borderColor: isSelected ? '#c3151c' : '#374151',
                        backgroundColor: isSelected ? '#c3151c' : '#1f2937',
                        color: isSelected ? '#ffffff' : '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {d.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Time */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={dark.label}>Reminder Time</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="#6b7280" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ ...dark.input, width: 'auto' }}
                  required
                />
              </div>
              <p style={{ ...dark.subtext, marginTop: '0.4rem' }}>Your reminder will be sent at or shortly after this time.</p>
            </div>

            {/* Timezone */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={dark.label}>Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. Africa/Lagos, UTC, America/New_York"
                style={dark.input}
                required
              />
              <p style={{ ...dark.subtext, marginTop: '0.4rem' }}>e.g. Africa/Lagos, UTC, America/New_York</p>
            </div>

            <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : <><Save size={18} /> Save Schedule</>}
            </button>
          </form>
        </div>

        {/* This Week's Calendar */}
        <div style={dark.card}>
          <h3 style={{ ...dark.divider, color: '#f3f4f6', fontWeight: 600 }}>This Week's Calendar</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {DAYS_OF_WEEK.map(d => {
              // Use live `days` state so the calendar updates instantly on toggle
              const isPreferred = days.includes(d);
              return (
                <div key={d} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  backgroundColor: isPreferred ? '#1f0a0b' : '#111827',
                  border: `1px solid ${isPreferred ? '#7f1d1d' : '#1f2937'}`,
                  borderRadius: '0.5rem',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      backgroundColor: isPreferred ? '#c3151c' : '#374151',
                      flexShrink: 0,
                    }} />
                    <span style={{ color: isPreferred ? '#f3f4f6' : '#9ca3af', fontWeight: isPreferred ? 600 : 400 }}>{d}</span>
                  </div>
                  {isPreferred && (
                    <span style={{
                      fontSize: '0.75rem', backgroundColor: '#7f1d1d',
                      color: '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 500
                    }}>Reminder</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#e5e7eb', marginBottom: '1rem', fontWeight: 600 }}>Recent Writing Activity</h4>
            {activity.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: '0.9rem', fontStyle: 'italic' }}>No writing activity logged this week.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activity.map(a => (
                  <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span>{a.activity_date} — {a.activity_type.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
