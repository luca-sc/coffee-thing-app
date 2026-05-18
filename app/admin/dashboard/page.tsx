'use client';

import { motion } from 'framer-motion';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RecentOrders } from '@/components/admin/recent-orders';
import { TablesOverview } from '@/components/admin/tables-overview';
import { RevenueChart } from '@/components/admin/revenue-chart';

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </motion.div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts */}
      <RevenueChart />

      {/* Tables & Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TablesOverview />
        <RecentOrders />
      </div>
    </div>
  );
}
