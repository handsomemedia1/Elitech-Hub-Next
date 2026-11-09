/**
 * Visitor consent for non-essential analytics (NDPA 2023 / GAID 2025).
 * Nothing in this category may load until the stored value is "granted".
 * Bump CONSENT_VERSION when the analytics tools or their purpose change,
 * so that visitors are asked again.
 */
export const CONSENT_VERSION = 1;
const STORAGE_KEY = 'elitech_cookie_consent';
const CHANGE_EVENT = 'elitech:consent-change';
export const OPEN_SETTINGS_EVENT = 'elitech:open-cookie-settings';

export type ConsentValue = 'granted' | 'denied' | 'unset';

export function readConsent(): ConsentValue {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'unset';
    const saved = JSON.parse(raw) as { value?: string; version?: number };
    if (saved.version !== CONSENT_VERSION) return 'unset';
    return saved.value === 'granted' || saved.value === 'denied' ? saved.value : 'unset';
  } catch {
    return 'unset';
  }
}

export function saveConsent(value: 'granted' | 'denied') {
  try {
    // The timestamp and version are the record of what the visitor agreed to.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ value, version: CONSENT_VERSION, decidedAt: new Date().toISOString() }),
    );
  } catch {
    // Storage blocked: the choice lasts for this page only, and analytics stay off on reload.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // choice made in another tab
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/** Removes cookies set by Google Analytics and Microsoft Clarity after consent is withdrawn. */
export function clearAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => /^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID|ANONCHK|SM$)/.test(name));
  const host = window.location.hostname;
  const domains = ['', `;domain=${host}`, `;domain=.${host.replace(/^www\./, '')}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`;
    }
  }
}
