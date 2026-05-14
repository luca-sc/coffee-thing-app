'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTableStore } from '@/store/table-store';
import { TableCard } from './table-card';

export function TablesGrid() {
  const { tables } = useTableStore();

  // Group tables by status for visual organization
  const freeTables = tables.filter(t => t.status === 'free');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const reservedTables = tables.filter(t => t.status === 'reserved');

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-table-free" />
          <span className="text-muted-foreground">Free ({freeTables.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-table-occupied" />
          <span className="text-muted-foreground">Occupied ({occupiedTables.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-table-reserved" />
          <span className="text-muted-foreground">Reserved ({reservedTables.length})</span>
        </div>
      </div>

      {/* Tables Grid - Restaurant Floor Layout */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <TableCard table={table} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
