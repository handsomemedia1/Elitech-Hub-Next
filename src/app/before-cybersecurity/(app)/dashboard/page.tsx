'use client';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good morning</h1>
      <p style={{ color: '#888', marginBottom: '3rem' }}>Welcome to Before Cybersecurity.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Progress Cards */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Guide Progress</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>Not started</div>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/before-cybersecurity/guide" style={actionLinkStyle}>Start Reading →</Link>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Your Assessment</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>Not started</div>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/before-cybersecurity/assessment" style={actionLinkStyle}>Take Assessment →</Link>
          </div>
        </div>

      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>
        Your Personalized Outcomes
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Locked Feature Cards */}
        <div style={{ ...cardStyle, opacity: 0.7, backgroundColor: '#0A0A0A' }}>
          <div style={cardHeaderStyle}>Your Report</div>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Understand your current strengths, gaps and possible directions.
          </p>
          <div style={lockedBadgeStyle}>Locked - Complete Assessment</div>
        </div>

        <div style={{ ...cardStyle, opacity: 0.7, backgroundColor: '#0A0A0A' }}>
          <div style={cardHeaderStyle}>Your Roadmap</div>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Your practical 30/60/90 day learning framework.
          </p>
          <div style={lockedBadgeStyle}>Locked - Complete Assessment</div>
        </div>

      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#111',
  border: '1px solid #222',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column' as const
};

const cardHeaderStyle = {
  color: '#888',
  fontSize: '0.85rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  marginBottom: '0.5rem'
};

const actionLinkStyle = {
  color: '#C3151C',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 500
};

const lockedBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#1a1a1a',
  color: '#666',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  alignSelf: 'flex-start'
};
