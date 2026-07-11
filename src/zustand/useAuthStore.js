import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/asyncstorage';
import api from '../api/axiosConfig';

const useAuthStore = create(
  persist(
    set => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      register: async registerData => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(`user/register`, registerData);
          set({ loading: false });
          return res.data; // Let component handle success message
        } catch (error) {
          console.log('Error during registration:', error);
          set({
            error: error?.response?.data?.message || 'Registration failed',
            loading: false,
          });
          throw error;
        }
      },
 
      otpVerify: async OtpData => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('user/verify-otp', OtpData);
          console.log('otp Verify response', res);
          if (res.data && res.data.token) {
            set({ token: res.data.token, user: res.data.user, loading: false });
          } else {
            set({ loading: false });
          }
          return res.data;
        } catch (error) {
          console.log('Error during OTP Verification:', error);
          set({
            error:
              error?.response?.data?.message || error.message || 'Otp failed',
            loading: false,
          });
          throw error;
        }
      },

   
   

      login: async (loginData) => {
        set({ loading: true, error: null });
        try {
console.log('loginData', loginData)
          const res = await api.post(`user/send-otp`, loginData);
          console.log("login api response=>", res)
          set({ loading: false });
          return res.data;
        } catch (error) {
          console.log('Error during login:', error.message, error.config?.url, error.response?.data);
          set({
            error: error?.response?.data?.message || 'Login failed',
            loading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          const res = await api.post('user/logout');
          return res.data;
        } catch (error) {
          console.log('Error during logout API call:', error);
          return null;
        } finally {
          set({ token: null, user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage', 
      storage: zustandStorage,
    },
  ),
);

export default useAuthStore;
