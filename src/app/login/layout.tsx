import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Login',
  description: 'Log in to your Elitech Hub student, researcher, or member portal.',
  alternates: {
    canonical: 'https://www.elitechub.com/login',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
