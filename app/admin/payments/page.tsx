"use client";

import { useTableStore } from '@/store/table-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const { orders, markOrderPaid, setPaymentMethod } = useTableStore();

  const handleMarkPaid = async (orderId: string) => {
    const ok = await markOrderPaid(orderId);
    if (ok) {
      toast.success('Order marked as paid');
    } else {
      toast.error('Failed to mark paid (check auth)');
    }
  };

  const handleSetMethod = async (orderId: string, method: 'card' | 'cash' | null) => {
    try {
      await setPaymentMethod(orderId, method);
      toast.success('Payment method updated');
    } catch {
      toast.error('Failed to update payment method');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-4">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Payments</h1>

      {orders.length === 0 ? (
        <div className="text-muted-foreground">No orders</div>
      ) : (
        orders.map(o => (
          <div key={o.id} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-xs text-muted-foreground">Table #{o.tableId} • Customer #{o.customerId}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSetMethod(o.id, 'card')}>Card</Button>
                <Button size="sm" onClick={() => handleSetMethod(o.id, 'cash')}>Cash</Button>
                <Button size="sm" variant={o.status === 'paid' ? 'default' : 'primary'} onClick={() => handleMarkPaid(o.id)} disabled={o.status === 'paid'}>
                  {o.status === 'paid' ? 'Paid' : 'Mark Paid'}
                </Button>
              </div>
            </div>
            <div className="text-sm">
              {o.items.map(it => (
                <div key={it.id} className="flex justify-between">
                  <div>{it.quantity}x {it.product?.name ?? it.productId}</div>
                  <div>${it.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
