'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { cn } from '@/lib/utils';

export function TablesOverview() {
  const { tables, customers } = useTableStore();

  const getTableCustomers = (tableId: string) => {
    return customers.filter(c => c.tableId === tableId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">Tables Overview</h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-table-free" />
            Free
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-table-occupied" />
            Occupied
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-table-reserved" />
            Reserved
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {tables.map((table) => {
            const tableCustomers = getTableCustomers(table.id);
            return (
              <div
                key={table.id}
                className={cn(
                  'relative p-3 rounded-lg border-2 text-center transition-all',
                  table.status === 'free' 
                    ? 'border-table-free/50 bg-table-free/10' 
                    : table.status === 'occupied'
                    ? 'border-table-occupied/50 bg-table-occupied/10'
                    : 'border-table-reserved/50 bg-table-reserved/10'
                )}
              >
                <div className={cn(
                  'absolute top-1 right-1 w-2 h-2 rounded-full',
                  table.status === 'free' ? 'bg-table-free' :
                  table.status === 'occupied' ? 'bg-table-occupied' :
                  'bg-table-reserved'
                )} />
                <span className="font-serif text-xl font-bold text-foreground">
                  {table.number}
                </span>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{tableCustomers.length}/{table.capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
