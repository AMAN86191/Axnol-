import {createApi} from '@reduxjs/toolkit/query/react';
import {mockBaseQuery} from '../mockBaseQuery';
import {Category, Industry, Product, SubCategory} from '../types';

export const catalogueApi = createApi({
  reducerPath: 'catalogueApi',
  baseQuery: mockBaseQuery,
  endpoints: builder => ({
    getIndustries: builder.query<Industry[], void>({
      query: () => ({url: 'industries'}),
    }),
    getCategories: builder.query<Category[], {industryId?: string}>({
      query: params => ({url: 'categories', params}),
    }),
    getSubCategories: builder.query<SubCategory[], {categoryId?: string}>({
      query: params => ({url: 'subcategories', params}),
    }),
    getProducts: builder.query<Product[], Record<string, any>>({
      query: params => ({url: 'products', params}),
    }),
    getProductById: builder.query<Product, string>({
      query: id => ({url: `products/${id}`}),
    }),
  }),
});

export const {
  useGetIndustriesQuery,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
} = catalogueApi;
