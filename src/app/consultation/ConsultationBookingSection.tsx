'use client';

import React, { useState } from 'react';
import styles from './consultation.module.css';
import PriceDisplay from '@/components/PriceDisplay';
import PaystackCheckoutButton from '@/components/PaystackCheckoutButton';

interface ConsultationOption {
  id: string;
  duration: string;
  description: string;
  fallbackPrice: string;
  popular?: boolean;
}

const CONSULTATION_OPTIONS: ConsultationOption[] = [
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
  const [selectedOption, setSelectedOption] = useState<ConsultationOption | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('NG');
  const [goals, setGoals] = useState('');
  const [formError, setFormError] = useState('');

  const openBookingModal = (option: ConsultationOption) => {
    setSelectedOption(option);
    setFormError('');
  };

  const closeBookingModal = () => {
    setSelectedOption(null);
    setFormError('');
  };

  const isFormValid = fullName.trim() !== '' && email.trim() !== '' && /^\S+@\S+\.\S+$/.test(email);

  return (
    <>
      <div className={styles.pricingGrid}>
        {CONSULTATION_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`${styles.pricingCard} ${opt.popular ? styles.popular : ''}`}
          >
            {opt.popular && <div className={styles.popularBadge}>RECOMMENDED</div>}
            <div className={styles.duration}>{opt.duration}</div>
            <div className={styles.price}>
              <PriceDisplay courseId={opt.id} fallback={opt.fallbackPrice} />
            </div>
            <p className="text-sm text-gray-400 mb-6">{opt.description}</p>
            <button
              type="button"
              onClick={() => openBookingModal(opt)}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Book {opt.duration.replace(' Minutes', ' Min')}
            </button>
          </div>
        ))}
      </div>

      {selectedOption && (
        <div className={styles.modalOverlay} onClick={closeBookingModal} role="dialog" aria-modal="true">
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Book {selectedOption.duration} Consultation</h3>
                <p className={styles.modalSubtitle}>1-on-1 Cybersecurity Career &amp; Transition Strategy Call</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeBookingModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className={styles.priceBanner}>
              <span className={styles.priceBannerLabel}>Authoritative Session Fee:</span>
              <span className={styles.priceBannerAmount}>
                <PriceDisplay courseId={selectedOption.id} fallback={selectedOption.fallbackPrice} />
              </span>
            </div>

            <div className={styles.intakeNotice}>
              <p>
                <strong>Intake Protocol:</strong> After completing test mode payment, our mentoring team will email you the pre-consultation background questionnaire and a private scheduling link to pick your live video call time slot.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label htmlFor="consultation-name">Full Name *</label>
                <input
                  id="consultation-name"
                  type="text"
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
                  rows={3}
                  placeholder="Tell us briefly about your background and what you want to achieve from this session..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>

              {formError && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ⚠️ {formError}
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
                  label={`Pay for ${selectedOption.duration} (Paystack Test Mode)`}
                  onError={(err) => setFormError(err)}
                />

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeBookingModal}
                >
                  Cancel / Choose Different Duration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
