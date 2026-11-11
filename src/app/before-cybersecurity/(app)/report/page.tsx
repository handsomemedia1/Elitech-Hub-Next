import type { Metadata } from 'next';
import PaidGate from '../PaidGate';
import ReportClient from './ReportClient';

export const metadata: Metadata = { title: 'Your personalised report', robots: { index: false, follow: false } };

export default function ReportPage() {
  return (
    <PaidGate
      feature="Your personalised report"
      description="See your full gap analysis, strengths and the areas to work on, based on your assessment."
      returnPath="/before-cybersecurity/report"
    >
      <ReportClient />
    </PaidGate>
  );
}
