/**
 * Elitech Hub Authorized Contact Email Addresses & Information
 *
 * Business email policy:
 * - PRIMARY: The primary public contact email address used across the website,
 *   footer, contact page, inquiries, partnerships, sponsorships, and support.
 * - DIRECT: Direct contact email for founder correspondence and notification delivery.
 */
export const CONTACT_EMAILS = Object.freeze({
  PRIMARY: 'info@elitechub.com',
  DIRECT: 'elijah@elitechub.com',
} as const);

export const CONTACT_INFO = Object.freeze({
  PRIMARY_EMAIL: CONTACT_EMAILS.PRIMARY,
  DIRECT_EMAIL: CONTACT_EMAILS.DIRECT,
  PHONE_DISPLAY: '+234 708 196 8062',
  PHONE_RAW: '+2347081968062',
  WHATSAPP_URL: 'https://wa.me/2347081968062',
  LOCATION: 'Ibadan, Nigeria',
} as const);
