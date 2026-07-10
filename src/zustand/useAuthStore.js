import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/MMKV';
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
          const res = await api.post(`/user_register`, registerData);
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
      forgetPass: async (num) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(`/get_otp_for_forget_password`, num);
          set({ loading: false });
          return res.data; // Let component handle success message
        } catch (error) {
          console.log('Error during otp sending:', error);
          set({
            error: error?.response?.data?.message || 'Verification failed',
            loading: false,
          });
          throw error;
        }
      },
      otpVerify: async OtpData => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/verify_register_otp', OtpData);
          set({ loading: false });
          console.log('otp Verify response', res);
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
      forgetOtpVerify: async forgetData => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(`/verify_otp`, forgetData);
          set({ loading: false });
          console.log('otp Verify response', res);
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
      setPassword: async passData => {
        set({ loading: true, error: null });

        try {
          const res = await api.post('/set_pin', passData);

          console.log('Set Password API Response:', res);

          set({

            loading: false,
          });

          return res.data; // Return API response for UI handling
        } catch (error) {
          console.error('Error during Set Password:', error);

          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to set password';

          set({
            error: errorMsg,
            loading: false,
          });

          throw { ...error, message: errorMsg }; // Send error with message
        }
      },
      setForgetPassword: async ForgetpassData => {
        set({ loading: true, error: null });

        try {
          const res = await api.post('/update_password', ForgetpassData);

          console.log('Set Password API Response:', res);

          set({
            loading: false,
          });

          return res.data; // Return API response for UI handling
        } catch (error) {
          console.error('Error during Set Password:', error);

          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to set password';

          set({
            error: errorMsg,
            loading: false,
          });

          throw { ...error, message: errorMsg }; // Send error with message
        }
      },

      login: async (loginData) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(`/user_login`, loginData);
          console.log("login api response=>", res)
          set({ token: res.data.token, user: res.data, loading: false });
          // zustandStorage.setItem("user",res.data.data);
          return res.data;
        } catch (error) {
          console.log('Error during login:', error);
          set({
            error: error?.response?.data?.message || 'Login failed',
            loading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // MMKV key
      storage: zustandStorage,
    },
  ),
);

export default useAuthStore;
