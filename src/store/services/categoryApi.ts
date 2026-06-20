// src/store/services/categoryApi.ts
// Category API endpoints

import { baseApi } from './baseApi';
import type { Category, ApiResponse } from '@/types';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/api/v1/categories',
      providesTags: ['Category'],
    }),

    getCategory: builder.query<ApiResponse<Category>, number>({
      query: (id) => `/api/v1/categories/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetCategoriesQuery, useGetCategoryQuery } = categoryApi;
