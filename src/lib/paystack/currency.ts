/**
 * Paystack Currency & Subunit Handling
 * 
 * Paystack requires all transaction amounts to be sent as integer subunits.
 * 
 * IMPORTANT XOF NOTE:
 * Even though West African CFA Franc (XOF) does not have everyday fractional coins,
 * Paystack's API documentation explicitly dictates that XOF amounts MUST be multiplied
 * by 100 in the API payload (e.g. charging 1,000 XOF requires sending 100,000 in the amount field).
 */

// Currencies supported by Paystack for direct checkout initialization
export const PAYSTACK_SUPPORTED_CHECKOUT_CURRENCIES = Object.freeze([
  'NGN',
  'GHS',
  'ZAR',
  'USD',
  'KES',
  'XOF',
] as const);

export type PaystackSupportedCurrency = typeof PAYSTACK_SUPPORTED_CHECKOUT_CURRENCIES[number];

/**
 * Checks if a given currency code is directly supported for Paystack checkout.
 */
export function isPaystackSupportedCurrency(currency: string): boolean {
  if (!currency || typeof currency !== 'string') return false;
  return PAYSTACK_SUPPORTED_CHECKOUT_CURRENCIES.includes(
    currency.toUpperCase().trim() as PaystackSupportedCurrency
  );
}

/**
 * Returns the subunit multiplier for Paystack API payload.
 * All supported checkout currencies (including XOF per Paystack specification)
 * use a multiplier of 100.
 */
export function getPaystackSubunitMultiplier(currency: string): number {
  const code = currency.toUpperCase().trim();
  switch (code) {
    case 'NGN': // 100 kobo
    case 'GHS': // 100 pesewas
    case 'ZAR': // 100 cents
    case 'USD': // 100 cents
    case 'KES': // 100 cents
    case 'XOF': // Paystack documented requirement: multiply by 100
      return 100;
    default:
      return 100;
  }
}

/**
 * Converts a standard currency amount (e.g. 100000.00 NGN or 950.00 GHS) into
 * Paystack's required integer subunit (e.g. 10000000 or 95000).
 * 
 * Uses safe integer arithmetic and rejects invalid, non-numeric, or negative amounts.
 */
export function convertToPaystackSubunits(amount: number, currency: string): number {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    throw new Error(`Invalid payment amount: received non-finite number (${amount})`);
  }

  if (amount <= 0) {
    throw new Error(`Invalid payment amount: amount must be strictly greater than 0 (received ${amount})`);
  }

  const multiplier = getPaystackSubunitMultiplier(currency);
  
  // Safe decimal scaling to prevent IEEE 754 precision issues (e.g. 19.99 * 100 = 1998.9999999999998)
  const subunits = Math.round(Number((amount * multiplier).toFixed(4)));

  if (!Number.isSafeInteger(subunits) || subunits <= 0) {
    throw new Error(`Amount conversion out of safe integer bounds for ${amount} ${currency}`);
  }

  return subunits;
}

/**
 * Converts Paystack integer subunits back into standard currency units.
 */
export function convertFromPaystackSubunits(subunits: number, currency: string): number {
  if (typeof subunits !== 'number' || !Number.isSafeInteger(subunits) || subunits <= 0) {
    throw new Error(`Invalid subunit amount: ${subunits}`);
  }

  const multiplier = getPaystackSubunitMultiplier(currency);
  return Number((subunits / multiplier).toFixed(2));
}
