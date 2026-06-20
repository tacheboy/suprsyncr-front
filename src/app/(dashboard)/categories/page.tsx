'use client';

import { useGetCategoriesQuery } from '@/store/services/categoryApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, FolderOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();

  const categories = data?.data || [];
  
  // Group by parentId
  const roots = categories.filter(c => !c.parentId);
  const getChildren = (parentId: number) => categories.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8 animate-fade-in">
      <PageHeader
        title="Product Categories"
        description="Manage your product categories and subcategories"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : roots.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-slate-200">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No Categories Found</h3>
          <p className="mt-1 text-sm text-slate-500">Categories might not have been loaded correctly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roots.map(root => {
            const children = getChildren(root.id);
            return (
              <Card key={root.id} className="p-6 overflow-hidden relative border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 truncate" title={root.name}>{root.name}</h2>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Subcategories
                    </p>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full">
                      {children.length}
                    </span>
                  </div>
                  
                  {children.length > 0 ? (
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {children.map(child => (
                        <li key={child.id} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-default">
                          <Folder className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="truncate" title={child.name}>{child.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic py-2 text-center bg-slate-50 rounded-lg">No subcategories</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
