"use client";

/**
 * SmoothScroll - passthrough wrapper (Lenis removed for compatibility).
 * Native browser scroll works reliably across all devices.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
