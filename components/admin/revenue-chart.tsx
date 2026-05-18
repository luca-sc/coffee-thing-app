'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTableStore } from '@/store/table-store';
import { mockProducts, categoryLabels } from '@/data/mock-data';

const COLORS = ['#c4a574', '#8b7355', '#6b5344', '#d4b896', '#a08060', '#5a4534'];

export function RevenueChart() {
  const { orders } = useTableStore();

  // Calculate revenue by category
  const revenueByCategory = Object.entries(categoryLabels).map(([category, label]) => {
    const categoryRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => {
        const categoryItems = order.items.filter(item => item.product.category === category);
        return sum + categoryItems.reduce((itemSum, item) => itemSum + item.price, 0);
      }, 0);

    return {
      name: label,
      revenue: categoryRevenue,
    };
  });

  // Orders by status for pie chart
  const ordersByStatus = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Preparing', value: orders.filter(o => o.status === 'preparing').length },
    { name: 'Ready', value: orders.filter(o => o.status === 'ready').length },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
    { name: 'Paid', value: orders.filter(o => o.status === 'paid').length },
  ].filter(item => item.value > 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Revenue by Category Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-4"
      >
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Revenue by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 50)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'oklch(0.65 0.02 80)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.28 0.03 50)' }}
              />
              <YAxis 
                tick={{ fill: 'oklch(0.65 0.02 80)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.28 0.03 50)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.16 0.02 50)',
                  border: '1px solid oklch(0.28 0.03 50)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0.01 80)',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="oklch(0.65 0.15 55)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Orders by Status Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-4"
      >
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Orders by Status</h3>
        <div className="h-64">
          {ordersByStatus.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No orders to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.16 0.02 50)',
                    border: '1px solid oklch(0.28 0.03 50)',
                    borderRadius: '8px',
                    color: 'oklch(0.95 0.01 80)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
