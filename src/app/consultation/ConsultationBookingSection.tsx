'use client';

import { useState } from 'react';
import styles from './consultation.module.css';
import PriceDisplay, { type ProductId } from '@/components/PriceDisplay';
import PaystackCheckoutButton from '@/components/PaystackCheckoutButton';
import { Check, CheckCircle, Info, Lock } from '@/components/icons';

export interface ConsultationOption {
  id: ProductId;
  minutes: number;
  title: string;
  description: string;
  fallbackPrice: string;
  popular?: boolean;
}

export const CONSULTATION_OPTIONS: ConsultationOption[] = [
  {
    id: 'consultation-15',
    minutes: 15,
    title: 'Quick reality check',
    description: 'Ask specific questions about certifications, paths or what employers expect.',
    fallbackPrice: '₦15,000',
  },
  {
    id: 'consultation-30',
    minutes: 30,
    title: 'Standard assessment',
    description: 'For career changers who need a clear roadmap built around their background.',
    fallbackPrice: '₦30,000',
    popular: true,
  },
  {
    id: 'consultation-60',
    minutes: 60,
    title: 'Deep dive',
    description: 'CV review, behavioural mapping and a detailed strategy for breaking in.',
    fallbackPrice: '₦50,000',
  },
  {
    id: 'consultation-90',
    minutes: 90,
    title: 'Strategy session',
    description: 'Everything in the deep dive, plus interview preparation and portfolio critique.',
    fallbackPrice: '₦70,000',
  },
  {
    id: 'consultation-120',
    minutes: 120,
    title: 'Full career rebuild',
    description: 'A complete review of your profile and an end-to-end career plan.',
    fallbackPrice: '₦100,000',
  },
];

const INCLUDED = [
  'Live one-to-one video call',
  'Short questionnaire before the call, so no time is wasted',
  'Honest assessment of where you stand',
  'Clear next steps you can act on straight away',
];

export default function ConsultationBookingSection() {
  const [selected, setSelected] = useState<ConsultationOption>(CONSULTATION_OPTIONS[1]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('NG');
  const [goals, setGoals] = useState('');

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isFormValid = fullName.trim() !== '' && isEmailValid;

  return (
    <div>
      <div className={styles.options} role="radiogroup" aria-label="Session length">
        {CONSULTATION_OPTIONS.map((opt) => {
          const active = selected.id === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.option} ${active ? styles.optionActive : ''}`}
              onClick={() => setSelected(opt)}
            >
              {opt.popular && <span className={styles.optionBadge}>Most booked</span>}
              <span className={styles.optionCheck} aria-hidden="true">
                <Check size={13} weight="bold" />
              </span>
              <span className={styles.optionMinutes}>
                {opt.minutes}
                <span className={styles.optionUnit}>min</span>
              </span>
              <span className={styles.optionPrice}>
                <PriceDisplay courseId={opt.id} fallback={opt.fallbackPrice} />
              </span>
              <strong style={{ fontSize: '0.92rem' }}>{opt.title}</strong>
              <span className={styles.optionDesc}>{opt.description}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.checkout}>
        <form
          className={styles.panel}
          onSubmit={(e) => e.preventDefault()}
          noValidate
          aria-labelledby="booking-form-title"
        >
          <h3 id="booking-form-title" className={styles.panelTitle}>Your details</h3>
          <p className={styles.panelLead}>We use these to send your questionnaire and booking link.</p>

          <div className={styles.field}>
            <label htmlFor="consultation-name">Full name</label>
            <input
              id="consultation-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label htmlFor="consultation-email">Email</label>
              <input
                id="consultation-email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="consultation-phone">
                Phone<span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="consultation-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="consultation-country">Country</label>
            <select id="consultation-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="NG">Nigeria</option>
              <option value="GH">Ghana</option>
              <option value="KE">Kenya</option>
              <option value="ZA">South Africa</option>
              <option value="UK">United Kingdom</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="consultation-goals">
              What would you like to get out of the session?<span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="consultation-goals"
              rows={4}
              placeholder="Your background, where you want to get to, and the questions on your mind."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <p className={styles.note}>
            <Info size={18} aria-hidden="true" />
            After you pay, we email you a short questionnaire and a link to choose your call time.
          </p>
        </form>

        <aside className={styles.summary} aria-label="Booking summary">
          <span className={styles.summaryLabel}>Your session</span>
          <h3 className={styles.summaryTitle}>
            {selected.minutes}-minute consultation
          </h3>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>{selected.title}</span>
          <div className={styles.summaryPrice}>
            <PriceDisplay courseId={selected.id} fallback={selected.fallbackPrice} />
          </div>
          <ul className={styles.summaryList}>
            {INCLUDED.map((item) => (
              <li key={item}>
                <CheckCircle size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <PaystackCheckoutButton
            productId={selected.id}
            productType="consultation"
            email={email}
            name={fullName}
            countryCode={country}
            metadata={{
              duration: `${selected.minutes} Minutes`,
              goals: goals.trim() || 'General career guidance',
              phone: phone.trim() || undefined,
              product_type: 'consultation',
            }}
            callbackUrl="/thank-you"
            disabled={!isFormValid}
            label={`Pay and book ${selected.minutes} minutes`}
            showTestBadge={false}
            style={{ width: '100%' }}
          />

          {!isFormValid && <p className={styles.hint}>Add your name and email to continue.</p>}

          <p className={styles.secure}>
            <Lock size={14} aria-hidden="true" /> Secure payment by Paystack
          </p>
        </aside>
      </div>
    </div>
  );
}
