'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function CloudflareAnalytics() {
  const pathname = usePathname();

  // Exclude private routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/researcher') ||
    pathname.startsWith('/writer')
  ) {
    return null;
  }

  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
    />
  );
}
