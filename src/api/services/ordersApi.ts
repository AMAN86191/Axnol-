import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {Invoice, Order} from '../types';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getOrders: builder.query<Order[], void>({
      query: () => ({url: 'orders'}),
    }),
    getOrderById: builder.query<Order, string>({
      query: id => ({url: `orders/${id}`}),
    }),
    createOrder: builder.mutation<
      Order,
      {
        pricingRequestId?: string;
        items?: Array<{
          productId: string;
          quantity: number;
          unitPrice?: number;
        }>;
        shippingAddress?: string;
      }
    >({
      query: body => ({url: 'orders', method: 'POST', body}),
    }),
    getOrderInvoice: builder.query<Invoice, string>({
      query: id => ({url: `orders/${id}/invoice`}),
    }),
    getInvoices: builder.query<Invoice[], void>({
      query: () => ({url: 'invoices'}),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetOrderInvoiceQuery,
  useGetInvoicesQuery,
} = ordersApi;
