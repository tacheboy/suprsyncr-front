// src/app/(dashboard)/settings/profile/page.tsx
'use client';

import { useGetSellerProfileQuery } from '@/store/services/sellerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { data, isLoading } = useGetSellerProfileQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Profile"
        description="Manage your business information"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data?.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500">
                Business Name
              </label>
              <p className="text-lg font-semibold">{data.data.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                GSTIN
              </label>
              <p className="font-mono">{data.data.gstin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Address
              </label>
              <p>{data.data.businessAddress}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Phone
              </label>
              <p>{data.data.phoneNumber}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">
            Complete your seller profile to start selling
          </p>
        </div>
      )}
    </div>
  );
}
