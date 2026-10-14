import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Verification',
  description: 'Verify the authenticity of an official certificate issued by Elitech Hub.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CertificateIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
