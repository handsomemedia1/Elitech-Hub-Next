import type { Metadata } from 'next';
import PaidGate from '../PaidGate';
import ResourcesClient from './ResourcesClient';

export const metadata: Metadata = { title: 'The resource library', robots: { index: false, follow: false } };

export default function ResourcesPage() {
  return (
    <PaidGate
      feature="The resource library"
      description="Get the curated library of tools, courses and references linked to each chapter."
      returnPath="/before-cybersecurity/resources"
    >
      <ResourcesClient />
    </PaidGate>
  );
}
