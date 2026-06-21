'use client';

import { Bell, CheckCheck, CreditCard, Loader2, PackageCheck, Pencil, ShoppingBag, TrendingUp, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  type NotificationType,
  type StoreNotification,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/services/notificationApi';

const typeMeta: Record<NotificationType, { label: string; icon: typeof Bell; className: string }> = {
  NEW_ORDER: { label: 'New Order', icon: ShoppingBag, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ORDER_UPDATED: { label: 'Order Updated', icon: Pencil, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ORDER_CANCELLED: { label: 'Order Cancelled', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  PAYMENT_SUCCESSFUL: { label: 'Payment Successful', icon: CreditCard, className: 'bg-violet-50 text-violet-700 border-violet-200' },
  ORDER_FULFILLED: { label: 'Order Fulfilled', icon: PackageCheck, className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  ATTRIBUTION_COMPLETED: { label: 'Attribution Insight', icon: TrendingUp, className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function formatCurrency(notification: StoreNotification) {
  if (notification.orderTotal === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: notification.currency || 'INR',
  }).format(notification.orderTotal);
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function NotificationsPage() {
  const { data, isLoading, isError } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnMountOrArgChange: true,
  });
  const [markRead, { isLoading: markingRead }] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAllRead }] = useMarkAllNotificationsReadMutation();
  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600"><Bell className="h-4 w-4" /> Store activity</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Notifications</h1>
          <p className="mt-2 text-sm text-slate-600">Shopify order activity refreshes automatically every 30 seconds.</p>
        </div>
        <Button variant="outline" onClick={() => markAllRead()} disabled={unreadCount === 0 || markingAllRead}>
          {markingAllRead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
          Mark all as read
        </Button>
      </div>

      {isLoading && <div className="flex items-center gap-2 py-12 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading notifications…</div>}
      {isError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Notifications could not be loaded. Refresh the page and try again.</div>}
      {!isLoading && !isError && notifications.length === 0 && (
        <Card><CardContent className="py-12 text-center"><Bell className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700">No store activity yet</p><p className="mt-1 text-sm text-slate-500">New Shopify order events will appear here.</p></CardContent></Card>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => {
          const meta = typeMeta[notification.type];
          const Icon = meta.icon;
          return (
            <Card key={notification.id} className={notification.read ? 'border-slate-200' : 'border-violet-200 bg-violet-50/30'}>
              <CardContent className="flex gap-4 py-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${meta.className}`}><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">{meta.label}</h2>
                    {!notification.read && <span className="h-2 w-2 rounded-full bg-violet-600" aria-label="Unread" />}
                    <Badge variant="outline" className="text-xs font-normal">{formatTimestamp(notification.createdAt)}</Badge>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <span>Order: <strong className="text-slate-800">#{notification.externalOrderId || '—'}</strong></span>
                    <span>Customer: <strong className="text-slate-800">{notification.customerName || 'Guest'}</strong></span>
                    <span>Total: <strong className="text-slate-800">{formatCurrency(notification)}</strong></span>
                    <span>Payment: <strong className="capitalize text-slate-800">{notification.paymentStatus?.replaceAll('_', ' ') || 'Unknown'}</strong></span>
                  </div>
                </div>
                {!notification.read && <Button variant="ghost" size="sm" disabled={markingRead} onClick={() => markRead(notification.id)}>Mark read</Button>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
