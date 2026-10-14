import ThankYouClient from './ThankYouClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for reaching out to Elitech Hub.',
  alternates: { canonical: 'https://www.elitechub.com/thank-you' },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ThankYouClient />;
}
