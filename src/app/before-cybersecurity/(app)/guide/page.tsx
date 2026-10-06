export default function GuidePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '3rem', maxWidth: '600px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Before Cybersecurity Guide</h1>
        <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2rem' }}>
          The complete interactive guide will appear here after it has been added to your product library. You will be able to read online or download the PDF.
        </p>
        <div style={{ display: 'inline-block', backgroundColor: '#1a1a1a', color: '#666', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
          COMING SOON / UPLOAD GUIDE
        </div>
      </div>
    </div>
  );
}
