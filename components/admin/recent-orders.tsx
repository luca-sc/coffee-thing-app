'use client';

import { motion } from 'framer-motion';
import { Clock, Check, ChefHat, Utensils, CreditCard, Banknote } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusIcons = {
  pending: Clock,
  preparing: ChefHat,
  ready: Utensils,
  delivered: Check,
  paid: CreditCard,
};

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  preparing: 'bg-blue-500/10 text-blue-500',
  ready: 'bg-green-500/10 text-green-500',
  delivered: 'bg-purple-500/10 text-purple-500',
  paid: 'bg-gray-500/10 text-gray-500',
};

export function RecentOrders() {
  const { orders, customers, tables, updateOrderStatus, markOrderPaid } = useTableStore();

  // Sort orders by creation date (newest first)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || 0;
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    if (newStatus === 'paid') {
      markOrderPaid(orderId);
    } else {
      updateOrderStatus(orderId, newStatus as 'pending' | 'preparing' | 'ready' | 'delivered');
    }
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border"
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-serif text-lg font-semibold text-foreground">Recent Orders</h3>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-3">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet
            </div>
          ) : (
            recentOrders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <div
                  key={order.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', statusColors[order.status])}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Table #{getTableNumber(order.tableId)} - {getCustomerName(order.customerId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="text-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
                      {order.paymentMethod && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {order.paymentMethod === 'card' ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <Banknote className="h-3 w-3" />
                          )}
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>

                    {order.status !== 'paid' && (
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        {order.status === 'delivered' && order.paymentMethod && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'paid')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Confirm Paid
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
