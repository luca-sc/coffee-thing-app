"use client";

import { RecentOrders } from '@/components/admin/recent-orders';

export default function AdminOrdersPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Orders</h1>
      <RecentOrders />
    </div>
  );
}
