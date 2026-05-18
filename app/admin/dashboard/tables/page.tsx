'use client';

import { motion } from 'framer-motion';
import { Users, CreditCard, Banknote, Clock, Check } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminTablesPage() {
  const { tables, customers, orders, updateTableStatus, closeTableSession, markOrderPaid } = useTableStore();

  const getTableCustomers = (tableId: string) => {
    return customers.filter(c => c.tableId === tableId);
  };

  const getTableOrders = (tableId: string) => {
    return orders.filter(o => o.tableId === tableId);
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
        <h1 className="font-serif text-3xl font-bold text-foreground">Tables Management</h1>
        <p className="text-muted-foreground">View and manage all tables and their customers.</p>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => {
          const tableCustomers = getTableCustomers(table.id);
          const tableOrders = getTableOrders(table.id);
          const unpaidOrders = tableOrders.filter(o => o.paymentStatus !== 'paid');
          const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'bg-card rounded-xl border-2 overflow-hidden',
                table.status === 'free' ? 'border-table-free/50' :
                table.status === 'occupied' ? 'border-table-occupied/50' :
                'border-table-reserved/50'
              )}
            >
              {/* Header */}
              <div className={cn(
                'p-4 flex items-center justify-between',
                table.status === 'free' ? 'bg-table-free/10' :
                table.status === 'occupied' ? 'bg-table-occupied/10' :
                'bg-table-reserved/10'
              )}>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Table #{table.number}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{tableCustomers.length}/{table.capacity} seats</span>
                  </div>
                </div>
                <Badge variant={
                  table.status === 'free' ? 'default' :
                  table.status === 'occupied' ? 'destructive' : 'secondary'
                }>
                  {table.status}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                {tableCustomers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No customers</p>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {tableCustomers.map((customer) => {
                        const customerOrders = getCustomerOrders(customer.id);
                        const customerTotal = customerOrders.reduce((sum, o) => sum + o.total, 0);
                        const hasPaid = customerOrders.every(o => o.paymentStatus === 'paid');

                        return (
                          <div
                            key={customer.id}
                            className="p-3 bg-secondary/30 rounded-lg border border-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary">
                                    {customer.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium text-foreground">{customer.name}</span>
                              </div>
                              {hasPaid ? (
                                <Badge variant="default" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Unpaid
                                </Badge>
                              )}
                            </div>

                            {/* Customer Orders */}
                            {customerOrders.map((order) => (
                              <div key={order.id} className="mt-2 pt-2 border-t border-border">
                                <div className="space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        {item.quantity}x {item.product.name}
                                      </span>
                                      <span>${item.price.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    {order.paymentMethod && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {order.paymentMethod === 'card' ? (
                                          <CreditCard className="h-3 w-3" />
                                        ) : (
                                          <Banknote className="h-3 w-3" />
                                        )}
                                        {order.paymentMethod}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary">
                                      ${order.total.toFixed(2)}
                                    </span>
                                    {order.paymentStatus !== 'paid' && order.paymentMethod && (
                                      <Button
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                          markOrderPaid(order.id);
                                          toast.success('Payment confirmed!');
                                        }}
                                      >
                                        Confirm
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}

                {/* Footer Actions */}
                {table.status === 'occupied' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground">Unpaid Total</span>
                      <span className="font-semibold text-primary">${totalUnpaid.toFixed(2)}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        closeTableSession(table.id);
                        toast.success(`Table #${table.number} session closed`);
                      }}
                    >
                      Close Session
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
