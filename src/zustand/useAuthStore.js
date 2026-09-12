import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/asyncstorage';
import api from '../api/axiosConfig';
import { sendFirebaseOtp } from '../services/firebaseAuthService';

const useAuthStore = create(
  persist(
    set => ({
      token: null,
      user: null,
      loading: false,
      error: null,

checkPhoneExists: async phone => {
        set({ loading: true, error: null });
        try {
          // user/send-otp: 200 => user DB me EXIST karta hai, 4xx => user nahi mila
          const res = await api.post('user/send-otp', { phone });
          console.log('send-otp (signup check) response:', res.data);
          set({ loading: false });
          return { exists: true, message: '' };
        } catch (error) {
          set({ loading: false });
          const status = error?.response?.status;
          if (status >= 400 && status < 500) {
            // User DB me nahi mila => naya number, signup allow hai
            return { exists: false, message: '' };
          }
          throw error;
        }
      },

      register: async registerData => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(`user/register`, registerData);
          console.log('res :', res);
          const responseData = res.data?.data || res.data;
          if (responseData && responseData.token && responseData.user) {
            set({ token: responseData.token, user: responseData.user, loading: false });
          } else {
            set({ loading: false });
          }
          return responseData; // Let component handle success message
        } catch (error) {
          console.log('Error during registration:', error?.response?.data || error?.message || error);
          set({
            error: error?.response?.data?.message || 'Registration failed',
            loading: false,
          });
          throw error;
        }
      },

      otpVerify: async OtpData => {
        set({ loading: true, error: null });
        console.log('OtpData', OtpData)
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
          // 1. Backend check: user sabase pehle DB me exist karna chahiye (sirf login)
          const res = await api.post(`user/send-otp`, loginData)
          console.log("login api response=>", res)
          // 2. User exist karta hai -> tab hi Firebase OTP bhejo
          await sendFirebaseOtp(loginData.phone);
          set({ loading: false });
          return loginData;
        } catch (error) {
          console.log('Error during login:', error.message, error.config?.url, error.response?.data);
          set({
            error: error?.message || error?.response?.data?.message || 'Failed to send OTP',
            loading: false,
          });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('user/complete-profile', profileData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          console.log('update profile response', res.data);
          const responseData = res.data?.data || res.data;
          
          if (responseData && responseData.user) {
            const updatedUser = { ...responseData.user };
            if (responseData.profile) updatedUser.profile = responseData.profile;
            if (responseData.statistics) updatedUser.statistics = responseData.statistics;
            set((state) => ({ user: { ...state.user, ...updatedUser }, loading: false }));
          } else {
            set({ loading: false });
          }
          return res.data;
        } catch (error) {
          console.log('Error during profile update:', error);
          set({
            error: error?.response?.data?.message || 'Profile update failed',
            loading: false,
          });
          throw error;
        }
      },

      getProfile: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get('user/get-profile');
          console.log('get profile response:', res.data);
          const responseData = res.data?.data || res.data;
          
          if (responseData && responseData.user) {
            const updatedUser = { ...responseData.user };
            if (responseData.profile) updatedUser.profile = responseData.profile;
            if (responseData.statistics) updatedUser.statistics = responseData.statistics;
            set((state) => ({ user: { ...state.user, ...updatedUser }, loading: false }));
          } else {
            set({ loading: false });
          }
          return res.data;
        } catch (error) {
          console.log('Error fetching profile:', error);
          set({ loading: false });
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

      deleteAccount: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.delete('user/delete-account');
          set({ token: null, user: null, loading: false, error: null });
          return res.data; // Let component handle success message
        } catch (error) {
          console.log('Error during delete account:', error);
          set({
            error: error?.response?.data?.message || 'Failed to delete account',
            loading: false,
          });
          throw error;
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
