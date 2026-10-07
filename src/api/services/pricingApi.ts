import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {PricingRequest} from '../types';

export const pricingApi = createApi({
  reducerPath: 'pricingApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getPricingRequests: builder.query<PricingRequest[], {status?: string}>({
      query: params => ({url: 'pricing/requests', params}),
    }),
    createPricingRequest: builder.mutation<
      PricingRequest,
      {
        productId: string;
        quantity: number;
        unit?: string;
        targetPrice?: number;
        message?: string;
      }
    >({
      query: body => ({url: 'pricing/requests', method: 'POST', body}),
    }),
  }),
});

export const {useGetPricingRequestsQuery, useCreatePricingRequestMutation} =
  pricingApi;
