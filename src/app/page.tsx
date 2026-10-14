import HomePage from './HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.elitechub.com' }
};

export default function Page() {
  return <HomePage />;
}
