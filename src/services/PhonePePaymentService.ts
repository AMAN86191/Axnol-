import api from '../api/axiosConfig';
import {
  PAYMENT_ENV,
  MERCHANT_ID,
  BACKEND_READY,
  IS_PHONEPE_SUPPORTED,
  generateOrderId,
} from './paymentConfig';

/**
 * Payment service abstraction for PhonePe.
 *
 * - When BACKEND_READY is true: full SDK flow (create order server-side,
 *   start transaction via react-native-phonepe-pg, verify status).
 * - When BACKEND_READY is false: mock flow that simulates a successful
 *   payment so the UI journey can be developed/tested first.
 *
 * NOTE: The SDK is Android-only for now.
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
 */
export async function initPhonePe(): Promise<boolean> {
  if (IS_PHONEPE_SUPPORTED) {
    try {
      const PhonePePaymentSDK = require('react-native-phonepe-pg').default;
      const res = await PhonePePaymentSDK.init(
        PAYMENT_ENV,
        MERCHANT_ID,
        generateOrderId('FLOW'),
        true
      );
      return !!res;
    } catch (e) {
      console.log('PhonePe init error:', e);
      return false;
    }
  }
  return true;
}

/**
 * Self-test: verify the PhonePe SDK loads + init() works, and optionally
 * attempt to open the launcher with a dummy request body (no backend token).
 * Use this ONLY for testing whether the native SDK is wired up correctly.
 */
export async function sdkSelfTest(launchLauncher = true): Promise<{
  sdkLoaded: boolean;
  initOk: boolean;
  initDetail?: string;
  launchStatus?: string;
  launchError?: string;
}> {
  let result: any = { sdkLoaded: false, initOk: false };

  // 1) SDK module loaded?
  let PhonePePaymentSDK: any;
  try {
    PhonePePaymentSDK = require('react-native-phonepe-pg').default;
    result.sdkLoaded = true;
  } catch (e: any) {
    result.sdkLoaded = false;
    return { ...result, initDetail: 'SDK module load failed: ' + e?.message };
  }

  // 2) init()
  try {
    const initRes = await PhonePePaymentSDK.init(
      PAYMENT_ENV,
      MERCHANT_ID,
      generateOrderId('FLOW'),
      true
    );
    result.initOk = !!initRes;
    result.initDetail = 'init returned: ' + JSON.stringify(initRes);
  } catch (e: any) {
    result.initOk = false;
    result.initDetail = 'init threw: ' + e?.message;
    return result;
  }

  // 3) optionally attempt to launch the SDK sheet with a dummy request
  if (launchLauncher && result.initOk) {
    const dummyToken = `MOCK_SELFTEST_TOKEN_${Date.now()}`;
    const requestBody = JSON.stringify({
      orderId: generateOrderId('TEST'),
      merchantId: MERCHANT_ID,
      token: dummyToken,
      paymentMode: { type: 'PAY_PAGE' },
    });
    try {
      const launch = await PhonePePaymentSDK.startTransaction(
        requestBody,
        'gaumatatrust'
      );
      result.launchStatus = launch?.status ?? 'UNKNOWN';
      result.launchError = launch?.error;
    } catch (e: any) {
      result.launchStatus = 'ERROR';
      result.launchError = e?.message;
    }
  }

  return result;
}

/**
 * Server-side order creation.
 * Expects a Laravel endpoint `POST /payment/create-order` that:
 * - generates the API checksum (saltKey) server-side,
 * - calls PhonePe `/pg/v1/pay` to get the order token,
 * - returns { orderId, token }.
 */
export async function createOrder(amount: number): Promise<{ orderId: string; token: string }> {
  if (BACKEND_READY) {
    try {
      const res = await api.post('/payment/create-order', { amount });
      const data = res.data;
      if (!data?.orderId || !data?.token) {
        throw new Error(data?.message || 'Invalid create-order response');
      }
      return { orderId: data.orderId, token: data.token };
    } catch (e: any) {
      console.log('createOrder error:', e?.response?.data || e?.message);
      throw new Error(e?.response?.data?.message || e?.message || 'create-order failed');
    }
  }
  // Mock order — no real charge.
  return { orderId: generateOrderId(), token: `MOCK_TOKEN_${Date.now()}` };
}

/**
 * Start the transaction on the SDK, or mock a success when backend not ready.
 */
export async function startPhonePeTransaction(amount: number, flowLabel: string): Promise<PaymentResult> {
  if (!BACKEND_READY) {
    await delay(1500); // simulate the PhonePe sheet
    return {
      status: 'SUCCESS',
      transactionId: generateOrderId(),
      paymentMethod: 'UPI',
    };
  }

  if (!IS_PHONEPE_SUPPORTED) {
    return { status: 'FAILURE', transactionId: '', error: 'PhonePe supported on Android only' };
  }

  await initPhonePe();

  const { orderId, token } = await createOrder(amount);

  const requestBody = JSON.stringify({
    orderId,
    merchantId: MERCHANT_ID,
    token,
    paymentMode: { type: 'PAY_PAGE' },
  });

  try {
    const PhonePePaymentSDK = require('react-native-phonepe-pg').default;
    const result = await PhonePePaymentSDK.startTransaction(
      requestBody,
      'gaumatatrust'
    );

    const status = (result?.status || 'FAILURE') as PaymentStatus;
    if (status === 'SUCCESS') {
      // TODO(backend): confirm via order status / webhook before marking paid.
      return {
        status,
        transactionId: orderId,
        paymentMethod: 'UPI',
      };
    }
    return {
      status,
      transactionId: orderId,
      error: result?.error,
    };
  } catch (e: any) {
    return { status: 'FAILURE', transactionId: orderId, error: e?.message };
  }
}