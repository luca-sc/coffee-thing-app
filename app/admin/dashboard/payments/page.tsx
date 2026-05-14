'use client';

import { motion } from 'framer-motion';
import { DollarSign, CreditCard, Banknote, Clock, Check, TrendingUp } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const { orders, customers, tables, markOrderPaid } = useTableStore();

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  const cashPayments = paidOrders.filter(o => o.paymentMethod === 'cash');
  const cardPayments = paidOrders.filter(o => o.paymentMethod === 'card');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || 0;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">Track revenue and payment status.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${pendingRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cardPayments.length}</p>
              <p className="text-sm text-muted-foreground">Card Payments</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Banknote className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cashPayments.length}</p>
              <p className="text-sm text-muted-foreground">Cash Payments</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Payments */}
      {pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Payments ({pendingOrders.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
              >
                <div>
                  <p className="font-medium text-foreground">
                    Table #{getTableNumber(order.tableId)} - {getCustomerName(order.customerId)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {order.paymentMethod === 'card' ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <Banknote className="h-4 w-4" />
                    )}
                    <span>{order.paymentMethod} payment</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-primary text-lg">
                    ${order.total.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      markOrderPaid(order.id);
                      toast.success('Payment confirmed!');
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Paid Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border"
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Completed Payments
          </h3>
        </div>
        <div className="p-4">
          {paidOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No completed payments yet.</p>
          ) : (
            <div className="space-y-3">
              {paidOrders
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Table #{getTableNumber(order.tableId)} - {getCustomerName(order.customerId)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {order.paymentMethod === 'card' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <Banknote className="h-4 w-4" />
                        )}
                        <span>{order.paymentMethod}</span>
                        <span>•</span>
                        <span>{new Date(order.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-green-500 text-lg">
                        ${order.total.toFixed(2)}
                      </span>
                      <Badge variant="default" className="ml-2">Paid</Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
