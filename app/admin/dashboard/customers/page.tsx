'use client';

import { motion } from 'framer-motion';
import { User, Receipt, CreditCard, Banknote, Check, Clock } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminCustomersPage() {
  const { customers, tables, orders } = useTableStore();

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || 0;
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground">View all active customers and their orders.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              <p className="text-sm text-muted-foreground">Active Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => {
                  const customerOrders = getCustomerOrders(c.id);
                  return customerOrders.every(o => o.paymentStatus === 'paid');
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Fully Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => {
                  const customerOrders = getCustomerOrders(c.id);
                  return customerOrders.some(o => o.paymentStatus !== 'paid');
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">With Pending Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <div className="col-span-full bg-card rounded-xl border border-border p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active customers at the moment.</p>
          </div>
        ) : (
          customers.map((customer, index) => {
            const customerOrders = getCustomerOrders(customer.id);
            const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
            const paidAmount = customerOrders
              .filter(o => o.paymentStatus === 'paid')
              .reduce((sum, o) => sum + o.total, 0);
            const unpaidAmount = totalSpent - paidAmount;
            const hasPendingPayments = unpaidAmount > 0;

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Header */}
                <div className={cn(
                  'p-4',
                  hasPendingPayments ? 'bg-yellow-500/10' : 'bg-green-500/10'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Table #{getTableNumber(customer.tableId)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={hasPendingPayments ? 'destructive' : 'default'}>
                      {hasPendingPayments ? 'Unpaid' : 'Paid'}
                    </Badge>
                  </div>
                </div>

                {/* Orders */}
                <div className="p-4">
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-secondary/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={
                              order.status === 'paid' ? 'default' : 'secondary'
                            } className="text-xs">
                              {order.status}
                            </Badge>
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
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.product.name}
                              </span>
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between mt-2 pt-2 border-t border-border">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-sm font-semibold text-primary">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-semibold">${totalSpent.toFixed(2)}</span>
                    </div>
                    {unpaidAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-destructive">Unpaid</span>
                        <span className="font-semibold text-destructive">
                          ${unpaidAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
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
