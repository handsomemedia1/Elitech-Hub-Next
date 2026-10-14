import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Research Membership',
  description: 'Join the Elitech Hub Research Network. Collaborate on cybersecurity, artificial intelligence, and digital security research projects.',
  alternates: {
    canonical: 'https://www.elitechub.com/research/membership/apply',
  },
  openGraph: {
    title: 'Apply for Research Membership | Elitech Hub',
    description: 'Join the Elitech Hub Research Network. Collaborate on cybersecurity, artificial intelligence, and digital security research projects.',
    url: 'https://www.elitechub.com/research/membership/apply',
    images: [{ url: 'https://www.elitechub.com/images/og-default.jpg' }],
  },
};

export default function ResearchMembershipApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
