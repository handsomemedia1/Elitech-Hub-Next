import type { Metadata } from 'next';
import PaidGate from '../PaidGate';
import RoadmapClient from './RoadmapClient';

export const metadata: Metadata = { title: 'Your roadmap', robots: { index: false, follow: false } };

export default function RoadmapPage() {
  return (
    <PaidGate
      feature="Your 30/60/90-day roadmap"
      description="Follow a step-by-step 30, 60 and 90-day plan matched to your assessment results."
      returnPath="/before-cybersecurity/roadmap"
    >
      <RoadmapClient />
    </PaidGate>
  );
}
