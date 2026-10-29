import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { clearAuth } from '../redux/AuthSlice';
import { toast } from '../components/ui/ToastProvider';
import { markSessionExpired } from './sessionEvents';
import { invalidateRequests } from './requestCache';
import { getNetworkErrorKind } from '../utils/apiError';
import { reportNetworkError, reportNetworkOk } from '../utils/connectivity';

const API_URL = 'https://axnol.tambimotors.com/api';

const sanitizeForLog = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /token|password|secret|authorization|cookie|api[-_]?key/i.test(key)
          ? '[REDACTED]'
          : sanitizeForLog(item),
      ]),
    );
  }
  return value;
};

const logApiError = (error: unknown) => {
  const axiosError = axios.isAxiosError(error) ? error : undefined;
  const config = axiosError?.config;
  const response = axiosError?.response;
  const url = config?.url?.split('?')[0];

  console.log('[API Error]', {
    method: config?.method?.toUpperCase(),
    url: config?.baseURL && url ? `${config.baseURL}${url}` : url,
    status: response?.status,
    code: axiosError?.code,
    message: axiosError?.message ?? String(error),
    response: response ? sanitizeForLog(response.data) : undefined,
  });
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('axnol_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    logApiError(error);
    return Promise.reject(error);
  },
);

let handlingSessionExpiry = false;

api.interceptors.response.use(
  response => {
    reportNetworkOk();
    return response;
  },
  async error => {
    logApiError(error);
    const status = error?.response?.status;
    const message = String(
      error?.response?.data?.message || error?.message || '',
    ).toLowerCase();
    const url = String(error?.config?.url || '');
    const isUnauthenticated =
      status === 401 || message.includes('unauthenticated');
    const isAuthRequest = /(login|register|otp|forgot|reset)/i.test(url);

    if (isUnauthenticated && !isAuthRequest && !handlingSessionExpiry) {
      const token = await AsyncStorage.getItem('axnol_token');
      if (token) {
        handlingSessionExpiry = true;
        try {
          await AsyncStorage.removeItem('axnol_token');
          await AsyncStorage.removeItem('axnol_user');
          markSessionExpired();
          invalidateRequests();
          store.dispatch(clearAuth());
          toast.warning(
            'Session Expired',
            'Your session has expired. Please login again to continue.',
          );
        } catch {
          // ignore
        } finally {
          setTimeout(() => {
            handlingSessionExpiry = false;
          }, 2000);
        }
      }
    }

    const networkKind = getNetworkErrorKind(error);
    if (networkKind) {
      // The global NetworkBanner shows the message and a Retry button.
      reportNetworkError(networkKind);
    } else if (error?.response) {
      // The server answered, so the connection itself is fine.
      reportNetworkOk();
    }

    return Promise.reject(error);
  },
);

export default api;
