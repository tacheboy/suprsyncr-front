// src/types/api/order.types.ts
// Order types

import { PlatformType } from './seller.types';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  externalOrderId: string;
  platformType: PlatformType;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  totalAmount: number;
  trackingNumber?: string;
  courierPartner?: string;
  warehouseId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
