"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll - Next.js Client Component Wrapper
 * Implements Lenis for ultra-premium, physics-based inertia scrolling.
 * This hijacked scrolling is a hallmark of Awwwards-winning websites,
 * removing the native choppy browser scroll and replacing it with a fluid glide.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom premium easing curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2, // Smooth touch experience
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
