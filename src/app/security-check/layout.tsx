import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Domain & Email Security Health Check',
  description: 'Instantly check your company domain and email security posture. Assess SPF, DMARC, DKIM, MX configuration, and SSL vulnerabilities for Nigerian businesses.',
  alternates: {
    canonical: 'https://www.elitechub.com/security-check',
  },
  openGraph: {
    title: 'Free Domain & Email Security Health Check',
    description: 'Instantly check your company domain and email security posture. Assess SPF, DMARC, DKIM, and SSL resilience.',
    url: 'https://www.elitechub.com/security-check',
    siteName: 'Elitech Hub',
    locale: 'en_NG',
    images: [
      {
        url: 'https://www.elitechub.com/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Elitech Hub Domain Security Check',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Domain & Email Security Health Check',
    description: 'Audit your domain for email spoofing and DNS security vulnerabilities.',
    images: ['https://www.elitechub.com/images/og-default.jpg'],
  },
};

export default function SecurityCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
