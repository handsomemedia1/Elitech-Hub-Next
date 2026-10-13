'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './thank-you.module.css';
import Link from 'next/link';

interface VerifiedTransaction {
  reference: string;
  status: 'successful' | 'abandoned' | 'failed';
  product: {
    id: string;
    type: string;
  };
  amount: number;
  currency: string;
  paidAt: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  'bootcamp': '6-Week Cybersecurity Bootcamp',
  'professional': '16-Week Professional Cybersecurity Programme',
  'ai_training': 'AI-Powered Cybersecurity Programme',
  'ai_security': 'AI Security and Reverse Vulnerability',
  'consultation-15': 'Cybersecurity Consultation – 15 Minutes',
  'consultation-30': 'Cybersecurity Consultation – 30 Minutes',
  'consultation-60': 'Cybersecurity Consultation – 60 Minutes',
  'consultation-90': 'Cybersecurity Consultation – 90 Minutes',
  'consultation-120': 'Cybersecurity Consultation – 120 Minutes',
};

function formatProductName(id?: string): string {
  if (!id) return 'Elitech Hub Service';
  return PRODUCT_LABELS[id] || id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const queryReference = searchParams.get('reference');

  // Verification state machine (initialized with verifying if reference is present)
  const [verificationState, setVerificationState] = useState<
    'idle' | 'verifying' | 'successful' | 'pending' | 'abandoned' | 'failed' | 'error'
  >(() => (queryReference && queryReference.trim() ? 'verifying' : 'idle'));
  const [verifiedTx, setVerifiedTx] = useState<VerifiedTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fallback state for direct visits without payment reference
  const [fallbackRef] = useState<string>(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EH-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  });
  const [userEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('elitech_user') || '{}');
        if (user.email) return user.email;
      } catch {}
    }
    return 'Check your email';
  });

  useEffect(() => {
    if (!queryReference || !queryReference.trim()) {
      return;
    }

    let isMounted = true;
    const ref = queryReference.trim();

    async function runVerification() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(ref)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.success && data.status === 'successful') {
          setVerifiedTx(data);
          setVerificationState('successful');
        } else if (data.status === 'pending') {
          setVerificationState('pending');
          setErrorMessage(data.message || 'Payment is currently pending confirmation from Paystack or your bank.');
        } else if (data.status === 'abandoned') {
          setVerificationState('abandoned');
          setErrorMessage(data.message || 'The transaction checkout session was abandoned or cancelled.');
        } else if (data.status === 'failed') {
          setVerificationState('failed');
          setErrorMessage(data.message || 'Payment could not be completed by the payment gateway.');
        } else {
          setVerificationState('error');
          setErrorMessage(data.error || 'Unable to verify payment status with gateway.');
        }
      } catch {
        if (isMounted) {
          setVerificationState('error');
          setErrorMessage('A network error occurred while verifying the payment. Please click Retry.');
        }
      }
    }

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [queryReference]);

  const handleRetryVerification = () => {
    if (!queryReference) return;
    setVerificationState('verifying');
    setErrorMessage('');

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(queryReference.trim())}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status === 'successful') {
          setVerifiedTx(data);
          setVerificationState('successful');
        } else if (data.status === 'pending') {
          setVerificationState('pending');
          setErrorMessage(data.message || 'Payment is still pending confirmation. Please check again in a moment.');
        } else if (data.status === 'abandoned') {
          setVerificationState('abandoned');
          setErrorMessage(data.message || 'The transaction was abandoned.');
        } else if (data.status === 'failed') {
          setVerificationState('failed');
          setErrorMessage(data.message || 'Payment failed.');
        } else {
          setVerificationState('error');
          setErrorMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setVerificationState('error');
        setErrorMessage('Network error during retry.');
      });
  };

  // ── 1. LOADING / VERIFYING STATE ────────────────────────────────
  if (verificationState === 'verifying') {
    return (
      <div className={styles.container}>
        <div className={styles.verifyingBox}>
          <div className={styles.spinner} />
          <h2 className={styles.title} style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Verifying Payment...
          </h2>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            Confirming your transaction securely with the Paystack gateway. Please do not close this window.
          </p>
          <span className={styles.badgeTest}>🛡️ Paystack Test Mode Verification</span>
        </div>
      </div>
    );
  }

  // ── 2. SUCCESSFUL PAYMENT RECEIPT ──────────────────────────────
  if (verificationState === 'successful' && verifiedTx) {
    const isConsultation = verifiedTx.product?.type === 'consultation';
    const isCourse = verifiedTx.product?.type === 'course' || verifiedTx.product?.type === 'programme';

    return (
      <div className={styles.container}>
        <div className={styles.successIcon}>✓</div>

        <span className={styles.badgeTest}>🛡️ Paystack Test Mode Verified</span>
        <h1 className={styles.title}>Payment Verified! 🎉</h1>
        <p className={styles.subtitle}>
          Thank you! Your transaction has been securely confirmed by the payment gateway.
        </p>

        <div className={styles.referenceBox}>
          <h3>Verified Transaction Reference</h3>
          <div className={styles.referenceCode}>{verifiedTx.reference}</div>
          <p className={styles.referenceNote}>
            Save this reference! It serves as your official payment receipt.
          </p>
        </div>

        <div className={styles.purchaseDetails}>
          <h4>TRANSACTION RECEIPT</h4>
          <div className={styles.detailRow}>
            <span>Item</span>
            <span style={{ fontWeight: 600 }}>{formatProductName(verifiedTx.product?.id)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Category</span>
            <span style={{ textTransform: 'capitalize' }}>{verifiedTx.product?.type || 'Service'}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Amount Paid</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>
              {verifiedTx.currency} {Number(verifiedTx.amount).toLocaleString()}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Status</span>
            <span className={styles.badgeSuccess}>SUCCESSFUL (TEST MODE)</span>
          </div>
          <div className={styles.detailRow}>
            <span>Timestamp</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {verifiedTx.paidAt ? new Date(verifiedTx.paidAt).toUTCString() : 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Tailored Next Steps */}
        <div className={styles.nextStepsCard}>
          <h4>Next Steps</h4>
          {isConsultation ? (
            <ol className={styles.nextStepsList}>
              <li>
                <strong>Pre-Consultation Intake:</strong> Our team will email your background assessment form within 24 hours.
              </li>
              <li>
                <strong>Schedule Time Slot:</strong> Use the private Google Meet/calendar link in the email to select your preferred time.
              </li>
              <li>
                <strong>Attend Live Session:</strong> Join the call for your honest, direct 1-on-1 cybersecurity strategy roadmap.
              </li>
            </ol>
          ) : isCourse ? (
            <ol className={styles.nextStepsList}>
              <li>
                <strong>Tuition Reservation Recorded:</strong> Your payment is securely logged and associated with your application.
              </li>
              <li>
                <strong>Admissions Review:</strong> Our committee reviews candidates independently (status: Pending Review).
              </li>
              <li>
                <strong>Onboarding &amp; Orientation:</strong> You will receive class schedules, Discord community invites, and lab setup guides.
              </li>
            </ol>
          ) : (
            <ol className={styles.nextStepsList}>
              <li>
                <strong>Fulfillment Confirmed:</strong> Our service team has been notified of your payment.
              </li>
              <li>
                <strong>Check Inbox:</strong> Look for a confirmation email containing access instructions.
              </li>
            </ol>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.print()}
            className={styles.btnSecondary}
          >
            🖨️ Print Receipt
          </button>
          <Link href="/programs" className={styles.btnPrimary}>
            View All Programs
          </Link>
        </div>

        <p className={styles.helpText}>
          Questions about your receipt?{' '}
          <a href="https://wa.me/2347081968062" target="_blank" rel="noopener noreferrer">
            Contact Admissions on WhatsApp
          </a>
        </p>
      </div>
    );
  }

  // ── 2B. PENDING PAYMENT CONFIRMATION STATE ────────────────────
  if (verificationState === 'pending') {
    return (
      <div className={styles.container}>
        <div className={styles.statusSpinner} style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />

        <span className={styles.badgeWarning}>⏳ Payment Pending</span>
        <h1 className={styles.title}>Payment Awaiting Confirmation</h1>
        <p className={styles.subtitle}>
          {errorMessage || 'Your payment is currently being processed. If you completed a transfer or card payment, confirmation may take a few moments.'}
        </p>

        {queryReference && (
          <div className={styles.referenceBox}>
            <h3>Transaction Reference</h3>
            <div className={styles.referenceCode} style={{ color: '#f59e0b' }}>
              {queryReference}
            </div>
          </div>
        )}

        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handleRetryVerification}
            className={styles.retryBtn}
          >
            🔄 Check Status Again
          </button>
          <Link href="/programs" className={styles.btnSecondary}>
            View Programs
          </Link>
        </div>

        <p className={styles.helpText}>
          Completed a bank transfer?{' '}
          <a href="https://wa.me/2347081968062" target="_blank" rel="noopener noreferrer">
            Notify Admissions on WhatsApp
          </a>
        </p>
      </div>
    );
  }

  // ── 3. ABANDONED / CANCELLED PAYMENT STATE ──────────────────────
  if (verificationState === 'abandoned' || verificationState === 'failed') {
    const isCancelled = verificationState === 'abandoned';

    return (
      <div className={styles.container}>
        <div className={styles.failedIcon}>✕</div>

        <span className={styles.badgeWarning}>🛡️ Paystack Test Mode</span>
        <h1 className={styles.title}>
          {isCancelled ? 'Payment Incomplete' : 'Payment Failed'}
        </h1>
        <p className={styles.subtitle}>
          {errorMessage || 'Your payment transaction was not completed. No charges were made.'}
        </p>

        {queryReference && (
          <div className={styles.referenceBox}>
            <h3>Attempted Reference</h3>
            <div className={styles.referenceCode} style={{ color: '#f87171' }}>
              {queryReference}
            </div>
          </div>
        )}

        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          <Link href="/apply" className={styles.retryBtn}>
            Return to Application
          </Link>
          <Link href="/consultation" className={styles.btnSecondary}>
            View Consultations
          </Link>
        </div>

        <p className={styles.helpText}>
          Need help completing payment?{' '}
          <a href="https://wa.me/2347081968062" target="_blank" rel="noopener noreferrer">
            Chat with us on WhatsApp
          </a>
        </p>
      </div>
    );
  }

  // ── 4. VERIFICATION ERROR STATE ────────────────────────────────
  if (verificationState === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.failedIcon}>⚠️</div>

        <span className={styles.badgeWarning}>Verification Notice</span>
        <h1 className={styles.title}>Unable to Verify Payment</h1>
        <p className={styles.subtitle}>
          {errorMessage || 'Could not verify transaction reference with payment gateway.'}
        </p>

        {queryReference && (
          <div className={styles.referenceBox}>
            <h3>Reference Code</h3>
            <div className={styles.referenceCode}>{queryReference}</div>
          </div>
        )}

        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          {queryReference && (
            <button
              type="button"
              onClick={handleRetryVerification}
              className={styles.retryBtn}
            >
              🔄 Retry Verification
            </button>
          )}
          <Link href="/" className={styles.btnSecondary}>
            Return Home
          </Link>
        </div>

        <p className={styles.helpText}>
          If your account was debited, please contact us with your reference:{' '}
          <a href="https://wa.me/2347081968062" target="_blank" rel="noopener noreferrer">
            WhatsApp Support (+234 708 196 8062)
          </a>
        </p>
      </div>
    );
  }

  // ── 5. DEFAULT FALLBACK: APPLICATION RECEIVED (NO PAYMENT REF) ─
  return (
    <div className={styles.container}>
      <div className={styles.successIcon}>✓</div>

      <h1 className={styles.title}>Application Received! 🎉</h1>
      <p className={styles.subtitle}>
        Thank you for applying. Our admissions team will review your application and get back to you shortly.
      </p>

      <div className={styles.referenceBox}>
        <h3>Your Application Reference</h3>
        <div className={styles.referenceCode}>{fallbackRef}</div>
        <p className={styles.referenceNote}>
          Save this code! Our admissions team may request it during your review.
        </p>
      </div>

      <div className={styles.purchaseDetails}>
        <h4>APPLICATION DETAILS</h4>
        <div className={styles.detailRow}>
          <span>Program</span>
          <span>Cybersecurity Training</span>
        </div>
        <div className={styles.detailRow}>
          <span>Email</span>
          <span>{userEmail}</span>
        </div>
        <div className={styles.detailRow}>
          <span>Admissions Status</span>
          <span className={styles.badgeWarning}>PENDING REVIEW</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/programs" className={styles.btnPrimary}>
          Explore Programs
        </Link>
        <Link href="/consultation" className={styles.btnSecondary}>
          Book Consultation
        </Link>
      </div>

      <p className={styles.helpText}>
        Need help?{' '}
        <a href="https://wa.me/2347081968062" target="_blank" rel="noopener noreferrer">
          Contact us on WhatsApp
        </a>
      </p>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className={styles.pageWrapper}>
      <Suspense fallback={<div className={styles.loadingFallback}>Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
