import Link from 'next/link';
import type { ReactNode } from 'react';
import { getServerUser } from '@/lib/auth';
import { checkUserEntitlement } from '@/lib/before-cybersecurity/entitlements';
import { Lock } from '@/components/icons';

/**
 * Renders paid Before Cybersecurity features only for customers who have
 * paid. The check runs on the server, so the feature's content and code are
 * never sent to visitors who have not bought the product.
 */
export default async function PaidGate({
  feature,
  description,
  returnPath,
  children,
}: {
  feature: string;
  description: string;
  returnPath: string;
  children: ReactNode;
}) {
  const user = await getServerUser();
  const entitlement = await checkUserEntitlement(user?.id, user?.role);
  if (entitlement.hasAccess) return <>{children}</>;

  const unavailable = entitlement.reason === 'db_unavailable';

  return (
    <div style={{ maxWidth: 560, margin: '3rem auto', padding: '2.5rem 2rem', textAlign: 'center', background: '#0F0F12', border: '1px solid #272730', borderRadius: 20 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, marginBottom: '1.25rem', color: '#FF5A60', background: 'rgba(195, 21, 28, 0.12)', border: '1px solid rgba(195, 21, 28, 0.3)', borderRadius: 16 }}>
        <Lock size={28} aria-hidden="true" />
      </span>
      <h1 style={{ margin: '0 0 0.6rem', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{feature} is part of the full edition</h1>
      <p style={{ margin: '0 0 1.75rem', color: '#A1A1AA', lineHeight: 1.65 }}>
        {unavailable ? 'We could not confirm your access right now. Please try again in a moment.' : description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        {!user && (
          <Link
            href={`/login?redirect=${encodeURIComponent(returnPath)}`}
            style={{ padding: '0.8rem 1.4rem', color: '#fff', fontWeight: 600, textDecoration: 'none', border: '1px solid #33333D', borderRadius: 10 }}
          >
            I already paid: sign in
          </Link>
        )}
        <Link
          href="/before-cybersecurity#pricing"
          style={{ padding: '0.8rem 1.4rem', color: '#fff', fontWeight: 700, textDecoration: 'none', background: '#C3151C', borderRadius: 10 }}
        >
          Unlock the full edition
        </Link>
      </div>
      {!user && (
        <p style={{ margin: '1.25rem 0 0', color: '#71717A', fontSize: '0.85rem' }}>
          Bought as a guest? Sign in or create an account with the email you paid with and your access unlocks automatically.
        </p>
      )}
    </div>
  );
}
