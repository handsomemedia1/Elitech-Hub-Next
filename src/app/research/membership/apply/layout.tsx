import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Research Membership',
  description: 'Submit your application for the Elitech Hub Behavioral Cybersecurity Research Membership. Join a curated cohort of 30 researchers globally.',
  alternates: {
    canonical: 'https://www.elitechub.com/research/membership/apply',
  },
  openGraph: {
    title: 'Apply for Research Membership',
    description: 'Submit your application for the Elitech Hub Behavioral Cybersecurity Research Membership.',
    url: 'https://www.elitechub.com/research/membership/apply',
    siteName: 'Elitech Hub',
    locale: 'en_NG',
    images: [{ url: 'https://www.elitechub.com/images/og-default.jpg' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply for Research Membership',
    description: 'Join a curated cohort of 30 researchers in Behavioral Cybersecurity.',
    images: ['https://www.elitechub.com/images/og-default.jpg'],
  },
};

export default function ResearchMembershipApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
