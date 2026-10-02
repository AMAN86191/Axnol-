import api from '../api/axiosConfig';
import {
  PAYMENT_ENV,
  MERCHANT_ID,
  CLIENT_ID,
  CLIENT_VERSION,
  BACKEND_READY,
  IS_PHONEPE_SUPPORTED,
  generateOrderId,
} from './paymentConfig';

/**
 * PhonePe Payment Gateway service (Standard Checkout - Mobile SDK).
 *
 * Flow (per latest PhonePe docs):
 *  1. App -> Laravel backend  POST /user/payment/create-order
 *     Backend calls PhonePe OAuth (/v1/oauth/token) to get an auth token,
 *     then calls /checkout/v2/sdk/order to create the order.
 *     Backend returns { orderId, token, merchantOrderId }.
 *  2. App calls PhonePePaymentSDK.init(env, merchantId, flowId, logging)
 *  3. App calls PhonePePaymentSDK.startTransaction(requestBody, appSchema)
 *  4. App calls backend  GET /user/payment/status/{merchantOrderId}
 *     (or relies on webhook) to confirm the payment before marking paid.
 *
 * The client secret is NEVER present here - it stays in Laravel's .env.
 */

type PaymentStatus = 'SUCCESS' | 'FAILURE' | 'INTERRUPTED';

interface PaymentResult {
  status: PaymentStatus;
  transactionId: string;
  paymentMethod?: string;
  error?: string;
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Initialize the PhonePe SDK. Safe to call multiple times.
 * @param flowId stable id for analytics (use merchant user id when available).
 */
export async function initPhonePe(flowId?: string): Promise<boolean> {
  if (IS_PHONEPE_SUPPORTED) {
    try {
      const PhonePePaymentSDK = require('react-native-phonepe-pg').default;
      const res = await PhonePePaymentSDK.init(
        PAYMENT_ENV,
        MERCHANT_ID,
        flowId || generateOrderId('FLOW'),
        __DEV__, // enable SDK logging only in development
      );
      return !!res;
    } catch (e) {
      console.log('PhonePe init error:', e);
      return false;
    }
  }
  return true;
}

export interface CreateOrderPayload {
  amount: number;
  plan_id?: number | null;
  donation_type?: string | null;
  mobile?: string | null;
  remark?: string | null;
}

export interface CreateOrderResult {
  /** PhonePe generated internal order id (used by the SDK). */
  orderId: string;
  /** Order token from /checkout/v2/sdk/order (passed to the SDK). */
  token: string;
  /** Our own merchant order id (used for status checks). */
  merchantOrderId: string;
}

/**
 * Server-side order creation.
 * Calls Laravel `POST /user/payment/create-order`, which talks to PhonePe.
 * Backend must return: {
 *   status: 'success',
 *   data: { orderId, token, merchantOrderId }
 * }  OR  { orderId, token, merchantOrderId }
 */
export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  if (BACKEND_READY) {
    try {
      console.log(' createOrder payload :', payload);
      const res = await api.post('user/payment/create-order', payload);
      console.log(' createOrder response :', res.data);
      const d = res.data || {};
      const data = d.data && Object.keys(d.data).length ? d.data : d;

      if (!data?.orderId || !data?.token) {
        throw new Error(data?.message || 'Invalid create-order response');
      }

      const sdkOrderId = data.orderId;
      const merchantOrderId = data.merchantOrderId || data.orderId;

      // The SDK requires the PhonePe generated internal order id
      // (e.g. "OMO123456789" / UUID), NOT our merchant order id (e.g. "GMT...").
      // If the backend returns a GMT-style id as `orderId`, the Pay will
      // ALWAYS fail with "Something went wrong".
      if (/^GMT/i.test(String(sdkOrderId))) {
        throw new Error(
          'BACKEND FIX NEEDED: createOrder response ka `orderId` GMT merchant id hai. ' +
            'Backend ko PhonePe ka internal orderId return karna hai (e.g. "OMO...") ' +
            'aur GMT id ko `merchantOrderId` field mein alag se de.',
        );
      }

      return {
        orderId: sdkOrderId,
        token: data.token,
        merchantOrderId,
      };
    } catch (e: any) {
      console.log('createOrder error:', e?.response?.data || e?.message);
      throw new Error(e?.response?.data?.message || e?.message || 'create-order failed');
    }
  }
  // Mock order — no real charge.
  const mockOrderId = generateOrderId('TEST');
  return { orderId: mockOrderId, token: `MOCK_TOKEN_${Date.now()}`, merchantOrderId: mockOrderId };
}

export type OrderState = 'COMPLETED' | 'PENDING' | 'FAILED' | 'UNKNOWN';

/**
 * Fetch the real order state from the backend.
 * Backend `GET /user/payment/status/{orderId}` returns:
 * { success:true, status_code:200, payment_status:'COMPLETED',
 *   transaction_id, response:{ state, transactionId, amount } }
 */
export async function fetchOrderState(merchantOrderId: string): Promise<OrderState> {
  if (!BACKEND_READY) return 'COMPLETED';
  try {
    const res = await api.get(`user/payment/status/${merchantOrderId}`);
    const d = res.data || {};
    const data = d.data || d;
    const state = (
      data?.payment_status ||
      data?.state ||
      data?.status ||
      data?.response?.state ||
      ''
    ).toUpperCase();
    if (state === 'COMPLETED' || state === 'PAID') return 'COMPLETED';
    if (state === 'FAILED' || state === 'FAILURE') return 'FAILED';
    if (state === 'PENDING' || state === 'CREATED' || state === '') return 'PENDING';
    return 'UNKNOWN';
  } catch (e: any) {
    console.log('fetchOrderState error:', e?.response?.data || e?.message);
    return 'UNKNOWN';
  }
}

/**
 * Start the transaction on the SDK, or mock a success when backend not ready.
 *
 * Mirrors the official sample flow:
 *   1. Call Laravel backend create-order -> { orderId, merchantOrderId, token }
 *   2. Initialize PhonePe SDK (env + merchantId MUST match backend)
 *   3. Build V2 SDK payload
 *   4. startTransaction -> confirm via backend status -> screen calls purchase-plan
 */
export async function startPhonePeTransaction(
  orderPayload: CreateOrderPayload,
  flowLabel: string,
): Promise<PaymentResult> {
  if (!BACKEND_READY) {
    await delay(1200); // simulate the PhonePe sheet
    return {
      status: 'SUCCESS',
      transactionId: generateOrderId(),
      paymentMethod: 'UPI',
    };
  }

  if (!IS_PHONEPE_SUPPORTED) {
    return { status: 'FAILURE', transactionId: '', error: 'PhonePe supported on Android only' };
  }

  // 1. Create order on Laravel backend (it talks to PhonePe create-order API)
  const { orderId, token, merchantOrderId } = await createOrder(orderPayload);

  // 2. Initialize PhonePe SDK
  //    Environment MUST match backend (.env PHONEPE_ENV). 'PRODUCTION' | 'SANDBOX'
  //    Merchant ID MUST be 'GAUMATATRUSTONLINE'
  await initPhonePe(flowLabel);

  // 3. Build the V2 SDK payload.
  //    NOTE: merchantId + paymentMode are REQUIRED by this library's native
  //    module (validates paymentMode when parsing the body).
  const sdkPayload = JSON.stringify({
    orderId,
    merchantId: MERCHANT_ID,
    token,
    paymentMode: { type: 'PAY_PAGE' },
  });

  if (__DEV__) {
    console.log('[PhonePe] init env =', PAYMENT_ENV);
    console.log('[PhonePe] startTransaction body =', sdkPayload);
  }

  // 4. Start the transaction
  try {
    const PhonePePaymentSDK = require('react-native-phonepe-pg').default;
    const result = await PhonePePaymentSDK.startTransaction(sdkPayload, 'gaumatatrust');
    if (__DEV__) console.log('[PhonePe] SDK result =', JSON.stringify(result));

    const status = (result?.status || 'FAILURE') as PaymentStatus;

    // SDK says SUCCESS. Confirm payment with the backend via short polling
    // (the webhook finalizes it, the status API is the safety net).
    if (status === 'SUCCESS') {
      let state: OrderState = 'PENDING';
      for (let i = 0; i < 3; i++) {
        state = await fetchOrderState(merchantOrderId);
        if (state === 'COMPLETED' || state === 'FAILED') break;
        await delay(2000);
      }

      if (state === 'FAILED') {
        return {
          status: 'FAILURE',
          transactionId: merchantOrderId,
          error: 'Payment was not completed by the bank.',
        };
      }

      return {
        status,
        transactionId: merchantOrderId,
        paymentMethod: 'UPI',
      };
    }

    return {
      status,
      transactionId: merchantOrderId,
      error: result?.error,
    };
  } catch (e: any) {
    return { status: 'FAILURE', transactionId: merchantOrderId, error: e?.message };
  }
}