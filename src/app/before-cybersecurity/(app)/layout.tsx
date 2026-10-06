'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', path: '/before-cybersecurity/dashboard' },
    { name: 'My Assessment', path: '/before-cybersecurity/assessment' },
    { name: 'My Report', path: '/before-cybersecurity/report' },
    { name: 'My Roadmap', path: '/before-cybersecurity/roadmap' },
    { name: 'Guide', path: '/before-cybersecurity/guide' },
    { name: 'Resources', path: '/before-cybersecurity/resources' },
    { name: 'Account', path: '/before-cybersecurity/account' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#fff', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* Sidebar Desktop */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        backgroundColor: '#0d0d0d'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            Product
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', lineHeight: 1.2 }}>
            BEFORE<br/>CYBERSECURITY
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: isActive ? '#fff' : '#888',
                  backgroundColor: isActive ? '#1a1a1a' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #222' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← Back to Elitech-Hub
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Mobile Header (Hidden on Desktop natively, handled via media query usually, for now basic inline) */}
        <header style={{ 
          padding: '1rem', borderBottom: '1px solid #222', display: 'none' /* Will need CSS to show on mobile */
        }}>
          Mobile Nav Placeholder
        </header>
        
        <div style={{ padding: '3rem', maxWidth: '1000px', width: '100%' }}>
          {children}
        </div>
      </main>

    </div>
  );
}
