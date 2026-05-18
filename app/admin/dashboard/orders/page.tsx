'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Utensils, Check, CreditCard, Banknote, Filter } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const statusIcons = {
  pending: Clock,
  preparing: ChefHat,
  ready: Utensils,
  delivered: Check,
  paid: CreditCard,
};

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  preparing: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  ready: 'bg-green-500/10 text-green-500 border-green-500/30',
  delivered: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  paid: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

export default function AdminOrdersPage() {
  const { orders, customers, tables, updateOrderStatus, markOrderPaid } = useTableStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredOrders = orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .filter(o => paymentFilter === 'all' || o.paymentStatus === paymentFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || 0;
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'paid') {
      markOrderPaid(orderId);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px]">
              <CreditCard className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">No orders found matching your filters.</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-card rounded-xl border-2 overflow-hidden',
                  statusColors[order.status]
                )}
              >
                <div className="p-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', statusColors[order.status])}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Table #{getTableNumber(order.tableId)} - {getCustomerName(order.customerId)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                        {order.paymentStatus}
                      </Badge>
                      {order.paymentMethod && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          {order.paymentMethod === 'card' ? (
                            <CreditCard className="h-4 w-4" />
                          ) : (
                            <Banknote className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-foreground">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status Actions */}
                    <div className="flex flex-col gap-2 items-end justify-center">
                      <span className="font-serif text-2xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </span>
                      
                      {order.status !== 'paid' && (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            >
                              <ChefHat className="h-4 w-4 mr-1" />
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'ready')}
                            >
                              <Utensils className="h-4 w-4 mr-1" />
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Delivered
                            </Button>
                          )}
                          {order.status === 'delivered' && order.paymentMethod && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'paid')}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Confirm Paid
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
