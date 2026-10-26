import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { clearAuth } from '../redux/AuthSlice';
import { toast } from '../components/ui/ToastProvider';
import { markSessionExpired } from './sessionEvents';
import {
  getNetworkErrorKind,
  getNetworkErrorMessage,
} from '../utils/apiError';

const API_URL = 'https://axnol.tambimotors.com/api';

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
  error => Promise.reject(error),
);

let handlingSessionExpiry = false;
let lastNetworkToastAt = 0;

api.interceptors.response.use(
  response => response,
  async error => {
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
      const now = Date.now();
      if (now - lastNetworkToastAt > 4000) {
        lastNetworkToastAt = now;
        toast.error(
          networkKind === 'slow' ? 'Slow Internet Connection' : 'No Internet Connection',
          getNetworkErrorMessage(networkKind),
        );
      }
    }

    return Promise.reject(error);
  },
);

export default api;
