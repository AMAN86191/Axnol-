import { Platform } from 'react-native';

/**
 * PhonePe Payment Gateway configuration.
 *
 * IMPORTANT SECURITY:
 * - Only these values are safe to keep on the client:
 *     MERCHANT_ID, CLIENT_ID, CLIENT_VERSION
 * - The CLIENT_SECRET (a129e93a-... ) must NEVER be placed in this app.
 *   It lives only in the Laravel backend .env and is used there to:
 *     a) generate the OAuth auth-token,
 *     b) create the order token via /checkout/v2/sdk/order.
 */
/**
 * PhonePe SDK environment.
 * MUST MATCH the backend `.env` PHONEPE_ENV:
 *   - backend PHONEPE_ENV=sandbox  -> SDK 'SANDBOX'
 *   - backend PHONEPE_ENV=production -> SDK 'PRODUCTION'
 * Mismatch is the #1 cause of "Something went wrong" when clicking Pay.
 */
export const PAYMENT_ENV = 'PRODUCTION'; // 'SANDBOX' | 'PRODUCTION'

/** Merchant ID provided by PhonePe at onboarding. */
export const MERCHANT_ID = 'GAUMATATRUSTONLINE';

/** Client ID shared by PhonePe PG (used for debugging/analytics on client). */
export const CLIENT_ID = 'SU2609111800150744634227';

/** Client Version shared by PhonePe PG. */
export const CLIENT_VERSION = '1';

/**
 * Whether the Laravel backend order/create + status + webhook endpoints are ready.
 * - true  -> real flow (backend creates the order, returns order token).
 * - false -> mock flow (no real charge), lets the UI journey be tested.
 */
export const BACKEND_READY = true;

/**
 * Only Android integration is wired up for now (react-native-phonepe-pg).
 */
export const IS_PHONEPE_SUPPORTED = Platform.OS === 'android';

/**
 * Generate a unique merchant order id for a payment.
 * Only letters, numbers, "-" and "_" are allowed (max 63 chars).
 */
export function generateOrderId(prefix = 'GMT'): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}