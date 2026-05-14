'use client';

import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, UtensilsCrossed, TrendingUp, TrendingDown } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { cn } from '@/lib/utils';

export function DashboardStats() {
  const { tables, customers, orders } = useTableStore();

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const activeCustomers = customers.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      trend: '+8.2%',
      trendUp: true,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Customers',
      value: activeCustomers.toString(),
      icon: Users,
      trend: '+5.1%',
      trendUp: true,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Occupied Tables',
      value: `${occupiedTables}/${tables.length}`,
      icon: UtensilsCrossed,
      trend: '-2.3%',
      trendUp: false,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              stat.trendUp ? 'text-green-500' : 'text-red-500'
            )}>
              {stat.trendUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stat.trend}
            </div>
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground">{stat.value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
