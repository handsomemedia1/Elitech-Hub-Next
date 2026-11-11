'use client';

import React, { useState, useEffect } from 'react';
import { ProductPrice } from '@/lib/before-cybersecurity/pricing';
import { Lock as IconLock } from '@/components/icons';

export interface BeforeCybersecurityCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  currentPrice: ProductPrice;
  initialUser?: { id?: string; email?: string; name?: string } | null;
}

export default function BeforeCybersecurityCheckoutModal({
  isOpen,
  onClose,
  selectedCurrency,
  currentPrice,
  initialUser,
}: BeforeCybersecurityCheckoutModalProps) {
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser?.email) setEmail(initialUser.email);
    if (initialUser?.name) setName(initialUser.name);
  }, [initialUser]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address to receive your order receipt and access.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        productId: 'before-cybersecurity',
        productType: 'book',
        email: trimmedEmail,
        name: name.trim() || undefined,
        userId: initialUser?.id || undefined,
        countryCode: selectedCurrency === 'NGN' ? 'NG' : 'US',
        callbackUrl: '/thank-you',
      };

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.authorizationUrl) {
        // Redirect to Paystack secure checkout
        window.location.href = data.authorizationUrl;
      } else {
        const errorMsg = data.error || data.message || 'Unable to initialize checkout. Please try again.';
        setErrorMessage(errorMsg);
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('Network connection error. Please verify your internet and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#0F0F12',
          border: '1px solid #272730',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(195, 21, 28, 0.15)',
          color: '#F4F4F5',
          fontFamily: 'inherit',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close checkout"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#A1A1AA',
            fontSize: '1.5rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(195, 21, 28, 0.12)',
              border: '1px solid rgba(195, 21, 28, 0.3)',
              color: '#FF5A60',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              marginBottom: '0.5rem',
            }}
          >
            Instant Product Checkout
          </div>
          <h2
            id="checkout-modal-title"
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.35rem 0' }}
          >
            Before Cybersecurity
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#A1A1AA', margin: 0 }}>
            Complete 29-Chapter Interactive System, Personalized Report, 90-Day Roadmap &amp; PDF Edition.
          </p>
        </div>

        {/* Order Summary Box */}
        <div
          style={{
            backgroundColor: '#16161B',
            border: '1px solid #22222A',
            borderRadius: '10px',
            padding: '1.2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Time Purchase
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginTop: '0.2rem' }}>
              Full Interactive Access &amp; Downloads
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
              {currentPrice.symbol}
              {currentPrice.amount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#C3151C', fontWeight: 600 }}>{selectedCurrency}</div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="checkout-email"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D4D4D8', marginBottom: '0.4rem' }}
            >
              Email Address <span style={{ color: '#C3151C' }}>*</span>
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#16161B',
                border: '1px solid #2D2D38',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '0.35rem' }}>
              Your order receipt and access link will be dispatched to this email.
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="checkout-name"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D4D4D8', marginBottom: '0.4rem' }}
            >
              Full Name (Optional)
            </label>
            <input
              id="checkout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adebayo Ogunlesi"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#16161B',
                border: '1px solid #2D2D38',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.9rem',
              backgroundColor: '#C3151C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '2px solid #FFFFFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Connecting to Paystack...
              </>
            ) : (
              `Pay ${currentPrice.symbol}${currentPrice.amount.toLocaleString()} with Paystack →`
            )}
          </button>
        </form>

        {/* Trust & Guarantee Note */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #1E1E24',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: '#71717A',
            textAlign: 'center',
          }}
        >
          <div><IconLock size="1em" className="inline-icon" aria-hidden="true" /> 256-Bit SSL Encrypted &bull; Direct Paystack Gateway</div>
          <div>Supports Nigerian Debit Cards, Bank Transfer, USSD &amp; International Cards</div>
        </div>
      </div>
    </div>
  );
}
