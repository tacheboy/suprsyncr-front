// src/lib/constants.ts
// Application constants

import type { PlatformType, OrderStatus, ListingStatus } from '@/types';

// Platform configuration
export const PLATFORMS: Record<string, { label: string; color: string; description: string; fields: string[] }> = {
  AMAZON: {
    label: 'Amazon',
    color: 'amazon',
    description: 'Connect your Amazon Seller account',
    fields: ['seller_id', 'sp_api_token'],
  },
  FLIPKART: {
    label: 'Flipkart',
    color: 'flipkart',
    description: 'Connect your Flipkart Seller Hub',
    fields: ['api_key', 'seller_id'],
  },
  SHOPIFY: {
    label: 'Shopify',
    color: 'shopify',
    description: 'Connect your Shopify store',
    fields: ['shop_url', 'api_key', 'api_secret', 'access_token'],
  },
  BLINKIT: {
    label: 'Blinkit',
    color: 'blinkit',
    description: 'Connect to Blinkit quick-commerce',
    fields: ['api_url', 'api_token'],
  },
  WOOCOMMERCE: {
    label: 'WooCommerce',
    color: 'woocommerce',
    description: 'Connect your WooCommerce store',
    fields: ['store_url', 'consumer_key', 'consumer_secret'],
  },
  MEESHO: {
    label: 'Meesho',
    color: 'meesho',
    description: 'Connect your Meesho Seller account',
    fields: ['api_key', 'seller_id'],
  },
};

// Order status configuration
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: string }
> = {
  PENDING: { label: 'Pending', color: 'yellow', icon: 'Clock' },
  ACCEPTED: { label: 'Accepted', color: 'blue', icon: 'Check' },
  PROCESSING: { label: 'Processing', color: 'purple', icon: 'Package' },
  SHIPPED: { label: 'Shipped', color: 'cyan', icon: 'Truck' },
  DELIVERED: { label: 'Delivered', color: 'green', icon: 'CheckCircle' },
  CANCELLED: { label: 'Cancelled', color: 'red', icon: 'XCircle' },
};

// Listing status configuration
export const LISTING_STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Pending', color: 'yellow' },
  ACTIVE: { label: 'Active', color: 'green' },
  FAILED: { label: 'Failed', color: 'red' },
  DELISTED: { label: 'Delisted', color: 'gray' },
};

// Navigation items for sidebar
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Orders', href: '/orders', icon: 'ShoppingBag' },
  { label: 'Products', href: '/products', icon: 'Package' },
  { label: 'Inventory', href: '/inventory', icon: 'Warehouse' },
  { label: 'Listings', href: '/listings', icon: 'Globe' },
  { label: 'Categories', href: '/categories', icon: 'Tag' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
] as const;

export const AI_ITEMS = [
  { label: 'Product Studio', href: '/ai/product-studio', icon: 'Package' },
  { label: 'Insights', href: '/ai/insights', icon: 'TrendingUp' },
  { label: 'AI Chat', href: '/ai/chat', icon: 'MessageSquare' },
  { label: 'AI Services', href: '/autopilot/services', icon: 'Zap' },
  { label: 'Approval Queue', href: '/autopilot/queue', icon: 'Sparkles' },
  { label: 'Impact Lab', href: '/autopilot/impact-lab', icon: 'TrendingUp' },
] as const;

export const SETTINGS_ITEMS = [
  { label: 'Seller Profile', href: '/settings/profile', icon: 'User' },
  { label: 'Warehouses', href: '/settings/warehouses', icon: 'Building' },
  { label: 'Platforms', href: '/settings/platforms', icon: 'Plug' },
] as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
