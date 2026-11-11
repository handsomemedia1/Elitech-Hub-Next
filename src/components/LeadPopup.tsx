"use client";

import React, { useState, useEffect } from 'react';
import styles from './LeadPopup.module.css';
import { X } from '@/components/icons';

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let hasSeenPopup = false;
    try {
      hasSeenPopup = !!localStorage.getItem('elitech_popup_seen');
    } catch {
      return;
    }
    if (hasSeenPopup) return;

    // Only interrupt people who are clearly engaged: they have read most of
    // the page, or stayed a full minute. Popping up after 10 seconds covered
    // the page for visitors who had only just arrived, and many left.
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      setIsOpen(true);
      cleanup();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.6) open();
    };
    const timer = window.setTimeout(open, 60000);
    window.addEventListener('scroll', onScroll, { passive: true });
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
    return cleanup;
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('elitech_popup_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp, source: 'lead-popup' })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setMessage(data.message || 'Thank you for subscribing!');
        localStorage.setItem('elitech_popup_seen', 'true');
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <div className={styles.header}>
          <h2>Join Elitech Hub</h2>
          <p>Get the latest updates on cybersecurity, research, and exclusive programs directly to your inbox and WhatsApp.</p>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsapp"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+2348000000000"
                required
              />
            </div>

            {message && <p className={styles.error}>{message}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
