// src/app/(dashboard)/inventory/page.tsx
'use client';

import { useGetLowStockQuery } from '@/store/services/inventoryApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { data, isLoading } = useGetLowStockQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage stock levels across warehouses"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-sm font-semibold">Low Stock Items</h2>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.variantName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.sku}
                  </TableCell>
                  <TableCell>{item.warehouseName}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-amber-600">
                      {item.availableQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {item.reservedQuantity}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
