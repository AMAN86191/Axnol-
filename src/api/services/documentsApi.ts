import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {AppNotification, DocumentItem} from '../types';

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getNotifications: builder.query<AppNotification[], void>({
      query: () => ({url: 'notifications'}),
    }),
    markAllRead: builder.mutation<{message: string}, void>({
      query: () => ({url: 'notifications/read-all', method: 'POST'}),
    }),
    getDocuments: builder.query<
      DocumentItem[],
      {category?: string; search?: string}
    >({
      query: params => ({url: 'documents', params}),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useGetDocumentsQuery,
} = documentsApi;
