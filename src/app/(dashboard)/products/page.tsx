// src/app/(dashboard)/products/page.tsx
'use client';

import { useState } from 'react';
import { useGetProductsQuery } from '@/store/services/productApi';
import { useGetCategoriesQuery } from '@/store/services/categoryApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function ProductsPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const { data, isLoading } = useGetProductsQuery({
    page: 0,
    size: 50,
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedCategoryId !== undefined ? { categoryId: selectedCategoryId } : {}),
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const hasActiveFilters = !!selectedStatus || selectedCategoryId !== undefined;

  function clearFilters() {
    setSelectedStatus('');
    setSelectedCategoryId(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={
          data ? `${data.data.totalElements} total products` : 'Loading...'
        }
        action={
          <Link href="/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-slate-700">Filter:</span>
        </div>

        {/* Category filter */}
        <select
          id="products-category-filter"
          value={selectedCategoryId ?? ''}
          onChange={(e) =>
            setSelectedCategoryId(
              e.target.value === '' ? undefined : Number(e.target.value)
            )
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          id="products-status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[140px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 ml-1">
            {selectedCategoryId !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                {categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Category'}
                <button
                  onClick={() => setSelectedCategoryId(undefined)}
                  className="hover:text-blue-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium border border-violet-200">
                {selectedStatus}
                <button
                  onClick={() => setSelectedStatus('')}
                  className="hover:text-violet-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Variants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-slate-400 text-sm"
                  >
                    No products match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.content.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.categoryName}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(product.basePrice)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : product.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {product.variants.length} variants
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
