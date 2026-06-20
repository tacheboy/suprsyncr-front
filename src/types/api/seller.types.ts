// src/types/api/seller.types.ts
// Seller and Platform types

export interface Seller {
  id: number;
  businessName: string;
  gstin: string;
  businessAddress: string;
  phoneNumber: string;
  userId: number;
}

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type PlatformType = 'SHOPIFY' | 'BLINKIT' | 'WOOCOMMERCE' | 'MEESHO' | 'FLIPKART' | 'AMAZON';

export interface Platform {
  id: number;
  platformType: PlatformType;
  storeName: string;
  isActive: boolean;
  connectedAt: string;
}

export interface ConnectPlatformRequest {
  platformType: PlatformType;
  storeName: string;
  credentials: {
    shop_url?: string;
    api_key?: string;
    api_secret?: string;
    access_token?: string;
    store_url?: string;
    consumer_key?: string;
    consumer_secret?: string;
    api_url?: string;
    api_token?: string;
    seller_id?: string;
  };
}
