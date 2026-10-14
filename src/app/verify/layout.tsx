import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Credentials',
  description: 'Verify your certificate, email, or credentials issued by Elitech Hub.',
  alternates: {
    canonical: 'https://www.elitechub.com/verify',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
