import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {SafeUser} from '../types';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getProfile: builder.query<SafeUser, void>({
      query: () => ({url: 'profile'}),
    }),
    updateProfile: builder.mutation<
      SafeUser,
      Partial<SafeUser> & {completeProfile?: boolean}
    >({
      query: body => ({url: 'profile', method: 'PUT', body}),
    }),
    changePassword: builder.mutation<
      {message: string},
      {currentPassword: string; newPassword: string}
    >({
      query: body => ({url: 'profile/password', method: 'PUT', body}),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApi;
