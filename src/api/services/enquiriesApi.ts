import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {Enquiry} from '../types';

export const enquiriesApi = createApi({
  reducerPath: 'enquiriesApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    createEnquiry: builder.mutation<
      Enquiry,
      {
        type: 'product' | 'contact';
        name: string;
        email: string;
        phone?: string;
        productId?: string;
        productName?: string;
        subject?: string;
        message: string;
      }
    >({
      query: body => ({url: 'enquiries', method: 'POST', body}),
    }),
    getEnquiries: builder.query<Enquiry[], void>({
      query: () => ({url: 'enquiries'}),
    }),
  }),
});

export const {useCreateEnquiryMutation, useGetEnquiriesQuery} = enquiriesApi;
