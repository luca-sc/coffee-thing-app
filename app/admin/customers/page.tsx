"use client";

import { useState } from 'react';
import { useTableStore } from '@/store/table-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const { customers, tables, removeCustomerFromTable } = useTableStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setLoadingId(id);
    try {
      await removeCustomerFromTable(id);
      toast.success('Customer removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove customer');
    } finally {
      setLoadingId(null);
    }
  };

  const getTableNumber = (tableId: string) => tables.find(t => t.id === tableId)?.number ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Customers</h1>

      {customers.length === 0 ? (
        <div className="text-muted-foreground">No customers</div>
      ) : (
        <div className="space-y-3">
          {customers.map(c => (
            <div key={c.id} className="p-4 bg-card border border-border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">Table #{getTableNumber(c.tableId)} • {new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleRemove(c.id)} disabled={loadingId === c.id}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
