// src/app/(dashboard)/settings/warehouses/page.tsx
'use client';

import { useGetWarehousesQuery } from '@/store/services/sellerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WarehousesPage() {
  const { data, isLoading } = useGetWarehousesQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage your warehouse locations"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Warehouse
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.data.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {warehouse.name}
                  {warehouse.isDefault && (
                    <span className="text-xs font-normal bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{warehouse.address}</p>
                <p className="text-slate-500">
                  {warehouse.city}, {warehouse.state} - {warehouse.pincode}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
