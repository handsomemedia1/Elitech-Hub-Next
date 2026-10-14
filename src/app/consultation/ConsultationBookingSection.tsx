'use client';

import React, { useState, useRef } from 'react';
import styles from './consultation.module.css';
import PriceDisplay from '@/components/PriceDisplay';
import PaystackCheckoutButton from '@/components/PaystackCheckoutButton';

export interface ConsultationOption {
  id: string;
  duration: string;
  description: string;
  fallbackPrice: string;
  popular?: boolean;
}

export const CONSULTATION_OPTIONS: ConsultationOption[] = [
  {
    id: 'consultation-15',
    duration: '15 Minutes',
    description: 'Quick reality check. Ask specific questions about certifications, paths, or industry expectations.',
    fallbackPrice: '₦15,000',
  },
  {
    id: 'consultation-30',
    duration: '30 Minutes',
    description: 'Standard assessment. Ideal for career transitioners needing a clear, tailored technical roadmap.',
    fallbackPrice: '₦30,000',
    popular: true,
  },
  {
    id: 'consultation-60',
    duration: '60 Minutes',
    description: 'Deep dive. Resume review, behavioral mapping, and detailed strategy for breaking into the field.',
    fallbackPrice: '₦50,000',
  },
  {
    id: 'consultation-90',
    duration: '90 Minutes',
    description: 'Extended strategy session. Includes interview prep discussion and portfolio critique.',
    fallbackPrice: '₦70,000',
  },
  {
    id: 'consultation-120',
    duration: '120 Minutes',
    description: 'Comprehensive mentoring session. Full profile tear-down and end-to-end career plan rebuild.',
    fallbackPrice: '₦100,000',
  },
];

export default function ConsultationBookingSection() {
  const [selectedOption, setSelectedOption] = useState<ConsultationOption>(CONSULTATION_OPTIONS[1]); // Default to 30 Min Recommended
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('NG');
  const [goals, setGoals] = useState('');
  const [formError, setFormError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  const handleSelectOption = (option: ConsultationOption) => {
    setSelectedOption(option);
    setFormError('');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isFormValid = fullName.trim() !== '' && isEmailValid;

  return (
    <div className={styles.bookingWrapper}>
      {/* ── Duration Options Grid ── */}
      <div className={styles.pricingGrid} role="region" aria-label="Consultation duration options">
        {CONSULTATION_OPTIONS.map((opt) => {
          const isSelected = selectedOption.id === opt.id;
          return (
            <div
              key={opt.id}
              className={`${styles.pricingCard} ${opt.popular ? styles.popular : ''} ${
                isSelected ? styles.selectedCard : ''
              }`}
            >
              {opt.popular && <div className={styles.popularBadge}>RECOMMENDED</div>}
              <div className={styles.duration}>{opt.duration}</div>
              <div className={styles.price}>
                <PriceDisplay courseId={opt.id} fallback={opt.fallbackPrice} />
              </div>
              <p className="text-sm text-gray-400 mb-6">{opt.description}</p>
              <button
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`${styles.btn} ${isSelected ? styles.btnSelected : styles.btnPrimary}`}
                aria-pressed={isSelected}
              >
                {isSelected ? `✓ Selected (${opt.duration})` : `Book ${opt.duration.replace(' Minutes', ' Min')}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Full-Width Inline Booking Form ── */}
      <div
        id="consultation-booking-form"
        ref={formRef}
        className={styles.inlineBookingCard}
        aria-labelledby="consultation-form-title"
      >
        <div className={styles.inlineHeader}>
          <div className={styles.inlineHeaderLeft}>
            <span className={styles.stepBadge}>Step 2: Candidate Intake &amp; Booking</span>
            <h3 id="consultation-form-title" className={styles.inlineTitle}>
              Book {selectedOption.duration} Consultation
            </h3>
            <p className={styles.inlineSubtitle}>
              1-on-1 Cybersecurity Career &amp; Transition Strategy Call
            </p>
          </div>

          <div className={styles.priceBanner}>
            <span className={styles.priceBannerLabel}>Authoritative Session Fee</span>
            <span className={styles.priceBannerAmount}>
              <PriceDisplay courseId={selectedOption.id} fallback={selectedOption.fallbackPrice} />
            </span>
          </div>
        </div>

        {/* Duration Quick-Selector Pills */}
        <div className={styles.durationSelectorGroup}>
          <label className={styles.durationSelectorLabel}>Selected Duration:</label>
          <div className={styles.durationPills} role="radiogroup" aria-label="Select duration">
            {CONSULTATION_OPTIONS.map((opt) => {
              const isSelected = selectedOption.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.durationPill} ${isSelected ? styles.durationPillActive : ''}`}
                  onClick={() => handleSelectOption(opt)}
                >
                  {opt.duration} {opt.popular ? '★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intake Protocol Notice */}
        <div className={styles.intakeNotice}>
          <p>
            <strong>Intake Protocol:</strong> After completing payment, our mentoring team will email you the pre-consultation background questionnaire and a private scheduling calendar link to select your live video session.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="consultation-name">Full Name *</label>
            <input
              id="consultation-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (formError) setFormError('');
              }}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="consultation-email">Email Address *</label>
              <input
                id="consultation-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="consultation-phone">Phone Number</label>
              <input
                id="consultation-phone"
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="+234 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="consultation-country">Your Location / Country</label>
            <select
              id="consultation-country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="NG">Nigeria (NGN)</option>
              <option value="GH">Ghana (GHS)</option>
              <option value="KE">Kenya (KES)</option>
              <option value="ZA">South Africa (ZAR)</option>
              <option value="UK">United Kingdom</option>
              <option value="US">United States (USD)</option>
              <option value="CA">Canada</option>
              <option value="OTHER">Other Country</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="consultation-goals">Primary Questions / Transition Goals</label>
            <textarea
              id="consultation-goals"
              name="goals"
              rows={3}
              placeholder="Tell us briefly about your background and what you want to achieve from this session..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          {formError && (
            <div role="alert" className={styles.inlineAlert}>
              ⚠️ {formError}
            </div>
          )}

          {!isFormValid && (
            <p className={styles.inlineHelpText}>
              * Please enter your full name and a valid email address to enable payment.
            </p>
          )}

          <div className={styles.bookingActions}>
            <PaystackCheckoutButton
              productId={selectedOption.id}
              productType="consultation"
              email={email}
              name={fullName}
              countryCode={country}
              metadata={{
                duration: selectedOption.duration,
                goals: goals.trim() || 'General career guidance',
                phone: phone.trim() || undefined,
                product_type: 'consultation',
              }}
              callbackUrl="/thank-you"
              disabled={!isFormValid}
              label={`Proceed to Payment (${selectedOption.duration})`}
              onError={(err) => setFormError(err)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
