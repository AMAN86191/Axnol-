import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {CompanyInfo, HomeData} from '../types';

export const homeApi = createApi({
  reducerPath: 'homeApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getHome: builder.query<HomeData, void>({
      query: () => ({url: 'home'}),
    }),
    getCompany: builder.query<CompanyInfo, void>({
      query: () => ({url: 'company'}),
    }),
  }),
});

export const {useGetHomeQuery, useGetCompanyQuery} = homeApi;
