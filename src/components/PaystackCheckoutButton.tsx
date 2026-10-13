'use client';

import React, { useState } from 'react';
import styles from './PaystackCheckoutButton.module.css';

export interface PaystackCheckoutButtonProps {
  productId: string;
  productType?: string;
  email: string;
  name?: string;
  countryCode?: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  showTestBadge?: boolean;
  onSuccess?: (data: { authorizationUrl: string; reference: string }) => void;
  onError?: (errorMessage: string) => void;
}

export default function PaystackCheckoutButton({
  productId,
  productType,
  email,
  name,
  countryCode,
  metadata,
  callbackUrl = '/thank-you',
  label,
  children,
  className,
  style,
  disabled = false,
  showTestBadge = true,
  onSuccess,
  onError,
}: PaystackCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Prevent double submissions while in flight
    if (isLoading || isRedirecting || disabled) return;

    setErrorMessage(null);

    // Pre-flight validation
    const trimmedEmail = email?.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      const err = 'Please enter a valid email address before proceeding to payment.';
      setErrorMessage(err);
      if (onError) onError(err);
      return;
    }

    if (!productId?.trim()) {
      const err = 'Product selection is required for payment.';
      setErrorMessage(err);
      if (onError) onError(err);
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        productId: productId.trim(),
        productType: productType?.trim() || undefined,
        email: trimmedEmail,
        name: name?.trim() || undefined,
        countryCode: countryCode?.trim() || undefined,
        metadata: metadata || {},
        callbackUrl: callbackUrl.trim() || '/thank-you',
      };

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Payment gateway returned an invalid response (HTTP ${res.status}). Please try again.`);
      }

      if (!res.ok || !data?.success) {
        let displayError = (data?.error as string) || 'Payment initialization failed. Please try again.';

        if (res.status === 429) {
          displayError = 'Too many attempts. Please wait a moment before trying again.';
        } else if (data?.code === 'DATABASE_MIGRATION_REQUIRED') {
          displayError = 'Payment system maintenance in progress. Please contact support or try again shortly.';
        } else if (data?.code === 'FX_UNAVAILABLE') {
          displayError = (data.error as string) || 'Currency exchange rate is currently unavailable. Please select Nigeria or USD.';
        } else if (data?.code === 'UNSUPPORTED_CHECKOUT_CURRENCY') {
          displayError = (data.error as string) || 'This currency is not supported for direct checkout. Please checkout in NGN or USD.';
        }

        setErrorMessage(displayError);
        setIsLoading(false);
        if (onError) onError(displayError);
        return;
      }

      // Success: redirect to Paystack checkout URL
      setIsRedirecting(true);
      const authUrl = data.authorizationUrl as string | undefined;
      const txRef = data.reference as string | undefined;

      if (onSuccess && authUrl && txRef) {
        onSuccess({
          authorizationUrl: authUrl,
          reference: txRef,
        });
      }

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('No authorization URL returned by payment gateway.');
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'An unexpected network error occurred.';
      setErrorMessage(errText);
      setIsLoading(false);
      setIsRedirecting(false);
      if (onError) onError(errText);
    }
  };

  const buttonContent = isRedirecting ? (
    <>
      <span className={styles.spinner} />
      <span>Redirecting to Paystack...</span>
    </>
  ) : isLoading ? (
    <>
      <span className={styles.spinner} />
      <span>Connecting to Gateway...</span>
    </>
  ) : (
    label || children || 'Pay with Paystack'
  );

  const isLiveKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.startsWith('pk_live_');

  return (
    <div className={styles.checkoutButtonWrapper}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading || isRedirecting}
        className={`${styles.checkoutBtn} ${className || ''}`}
        style={style}
        aria-busy={isLoading || isRedirecting}
      >
        {buttonContent}
      </button>

      {showTestBadge && (
        <span
          className={styles.testBadge}
          title={
            isLiveKey
              ? 'Secured by Paystack Live Checkout'
              : 'Running in Paystack Sandbox Mode — no real charges'
          }
        >
          {isLiveKey ? '🔒 Paystack Secured' : '🛡️ Paystack Test Mode Sandbox'}
        </span>
      )}

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
