// src/types/api/product.types.ts
// Product and Category types

export interface ProductVariant {
  id: number;
  sku: string;
  variantName: string;
  attributes: Record<string, string>; // { color: 'Red', size: 'M' }
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  sku: string;
  basePrice: number;
  brand: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  images: string[];
  variants: ProductVariant[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sellerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId?: number;
  sku: string;
  basePrice: number;
  brand: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  variants: Omit<ProductVariant, 'id'>[];
}
