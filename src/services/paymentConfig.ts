import { Platform } from 'react-native';

/**
 * PhonePe Payment Gateway configuration.
 *
 * NOTE: PRODUCTION credentials for frontend SDK.
 * - merchantId: production merchant id provided by PhonePe.
 * - flowId: user-specific / session id used for analytics & debugging.
 *
 * The salt key (checksum) must NEVER live in the frontend. It is used
 * server-side by the backend to create orders and verify checksums.
 */
export const PAYMENT_ENV = 'PRODUCTION'; // 'SANDBOX' | 'PRODUCTION'
export const MERCHANT_ID = 'GAUMATATRUSTONLINE'; // prod merchant id

/**
 * Whether the Laravel backend order/create + webhook endpoints are ready.
 * While FALSE, PhonePePaymentService runs in mock mode (no real charge),
 * letting the UI payment flow be tested end-to-end.
 */
export const BACKEND_READY = false;

/**
 * Only Android integration is supported for now.
 */
export const IS_PHONEPE_SUPPORTED = Platform.OS === 'android';

/**
 * Generate a unique order / transaction id for a payment.
 */
export function generateOrderId(prefix = 'GMT'): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}