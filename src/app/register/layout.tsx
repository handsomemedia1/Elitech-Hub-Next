import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Create an account to access Elitech Hub learning platforms, materials, and certificates.',
  alternates: {
    canonical: 'https://www.elitechub.com/register',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
