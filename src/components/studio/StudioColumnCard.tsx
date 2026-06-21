import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudioColumnCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function StudioColumnCard({ title, description, children }: StudioColumnCardProps) {
  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">{children}</CardContent>
    </Card>
  );
}
