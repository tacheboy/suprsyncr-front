// src/store/services/productApi.ts
// Product API endpoints

import { baseApi } from './baseApi';
import type {
  Product,
  CreateProductRequest,
  PresignedUrlResponse,
  ApiResponse,
  PagedResponse,
} from '@/types';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      PagedResponse<Product>,
      {
        page?: number;
        size?: number;
        status?: string;
        search?: string;
        categoryId?: number;
      }
    >({
      query: (params) => ({
        url: '/api/v1/products',
        params: { page: params.page ?? 0, size: params.size ?? 20, ...params },
      }),
      providesTags: (result) =>
        result?.data.content
          ? [
              ...result.data.content.map((p) => ({
                type: 'Product' as const,
                id: p.id,
              })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: builder.query<ApiResponse<Product>, number>({
      query: (id) => `/api/v1/products/${id}`,
      providesTags: (_, __, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<
      ApiResponse<Product>,
      CreateProductRequest
    >({
      query: (body) => ({ url: '/api/v1/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: number; body: Partial<CreateProductRequest> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({ url: `/api/v1/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: number; status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Product', id }],
    }),

    getImageUploadUrl: builder.mutation<
      ApiResponse<PresignedUrlResponse>,
      { fileName: string; contentType: string }
    >({
      query: (body) => ({
        url: '/api/v1/products/images/upload-url',
        method: 'POST',
        body,
      }),
    }),

    confirmImageUpload: builder.mutation<
      ApiResponse<void>,
      { productId: number; imageKey: string }
    >({
      query: ({ productId, imageKey }) => ({
        url: `/api/v1/products/${productId}/images/confirm`,
        method: 'POST',
        params: { imageKey },
      }),
      invalidatesTags: (_, __, { productId }) => [
        { type: 'Product', id: productId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useGetImageUploadUrlMutation,
  useConfirmImageUploadMutation,
} = productApi;
