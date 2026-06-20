// src/types/api/inventory.types.ts
// Inventory types

export interface Inventory {
  id: number;
  productVariantId: number;
  variantName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // computed: quantity - reservedQuantity
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  productVariantId: number;
  warehouseId: number;
  quantity: number;
  notes?: string;
}
