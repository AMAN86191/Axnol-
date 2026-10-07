import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {AuthResponse, SafeUser} from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, {email: string; password: string}>({
      query: body => ({url: 'auth/login', method: 'POST', body}),
    }),
    register: builder.mutation<
      {message: string; userId: string; demoOtp: string},
      {
        name: string;
        email: string;
        phone: string;
        password: string;
        company?: string;
        designation?: string;
        role?: 'dealer' | 'customer';
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
      }
    >({
      query: body => ({url: 'auth/register', method: 'POST', body}),
    }),
    verifyOtp: builder.mutation<AuthResponse, {userId: string; otp: string}>({
      query: body => ({url: 'auth/verify-otp', method: 'POST', body}),
    }),
    resendOtp: builder.mutation<
      {message: string; demoOtp: string},
      {userId: string}
    >({
      query: body => ({url: 'auth/resend-otp', method: 'POST', body}),
    }),
    forgotPassword: builder.mutation<{message: string}, {email: string}>({
      query: body => ({url: 'auth/forgot-password', method: 'POST', body}),
    }),
    me: builder.query<SafeUser, void>({
      query: () => ({url: 'auth/me'}),
    }),
    logout: builder.mutation<{message: string}, void>({
      query: () => ({url: 'auth/logout', method: 'POST'}),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;
