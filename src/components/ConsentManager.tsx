"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import {
  OPEN_SETTINGS_EVENT,
  clearAnalyticsCookies,
  readConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";
import styles from "./ConsentManager.module.css";

/** Staff dashboards are never tracked and don't show the banner. */
function isPrivateRoute(path: string) {
  return (
    path.startsWith("/admin") ||
    path === "/writer" ||
    path.startsWith("/writer/") ||
    path === "/researcher" ||
    path.startsWith("/researcher/")
  );
}

// Advertising stays denied: the site runs no ads. Revisit when AdSense is added.
const GOOGLE_CONSENT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
`;

const CLARITY = `
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "yfcljkdjxl");
  window.clarity("consent");
`;

function AnalyticsTools() {
  return (
    <>
      <Script id="google-consent" strategy="afterInteractive">{GOOGLE_CONSENT}</Script>
      <GoogleTagManager gtmId="GTM-KK4JHHMT" />
      <Script id="microsoft-clarity" strategy="afterInteractive">{CLARITY}</Script>
      <CloudflareAnalytics />
      <Analytics />
    </>
  );
}

export default function ConsentManager() {
  const pathname = usePathname();
  // "loading" on the server, so the banner never causes a hydration mismatch.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "loading");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const choose = (value: "granted" | "denied") => {
    const withdrawing = consent === "granted" && value === "denied";
    saveConsent(value);
    setSettingsOpen(false);
    if (withdrawing) {
      // Loaded scripts can't be unloaded, so clear their cookies and start clean.
      clearAnalyticsCookies();
      window.location.reload();
    }
  };

  if (isPrivateRoute(pathname)) return null;

  const showBanner = consent === "unset" || (settingsOpen && consent !== "loading");

  return (
    <>
      {consent === "granted" && <AnalyticsTools />}
      {showBanner && (
        <div className={styles.banner} role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-text">
          <div className={styles.copy}>
            <h2 id="cookie-title" className={styles.title}>Can we use analytics cookies?</h2>
            <p id="cookie-text" className={styles.text}>
              They show us how people use this site, including clicks and pages visited, so we can improve it.
              They stay off unless you accept. Cookies the site needs to work are always on.{" "}
              <Link href="/policies#cookies">Cookie Policy</Link>
            </p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={() => choose("denied")}>Decline</button>
            <button type="button" className={styles.button} onClick={() => choose("granted")}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
