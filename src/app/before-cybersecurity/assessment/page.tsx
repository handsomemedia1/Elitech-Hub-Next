'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AssessmentPlaceholder() {
  const [step, setStep] = useState(1);
  const totalSteps = 15;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      fontFamily: 'var(--font-inter), sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Assessment Header */}
      <header style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 600, letterSpacing: '1px' }}>BEFORE CYBERSECURITY</div>
        <Link href="/before-cybersecurity" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
          Exit
        </Link>
      </header>

      {/* Assessment Body */}
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          
          <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
            Question {step} of {totalSteps}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: '1.3' }}>
            When confronted with a system you don&apos;t understand, what is your first instinct?
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button style={optionStyle}>I try to figure out how to break it or bypass its rules.</button>
            <button style={optionStyle}>I try to map out how all its pieces fit together.</button>
            <button style={optionStyle}>I read the documentation to see how it was designed to be used.</button>
            <button style={optionStyle}>I look for ways to protect it from being misused.</button>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              style={{
                background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '1rem'
              }}
            >
              ← Back
            </button>
            
            <button 
              onClick={() => setStep(Math.min(totalSteps, step + 1))}
              style={{
                backgroundColor: '#C3151C', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem'
              }}
            >
              Next →
            </button>
          </div>

        </div>
      </main>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', backgroundColor: '#222' }}>
        <div style={{ 
          width: `${(step / totalSteps) * 100}%`, 
          height: '100%', 
          backgroundColor: '#C3151C',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

const optionStyle = {
  backgroundColor: '#111',
  border: '1px solid #333',
  color: '#eee',
  padding: '1.25rem',
  borderRadius: '8px',
  textAlign: 'left' as const,
  fontSize: '1.05rem',
  cursor: 'pointer',
  transition: 'border-color 0.2s'
};
