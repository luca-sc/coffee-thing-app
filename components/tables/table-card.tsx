'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Table } from '@/types';
import { useTableStore } from '@/store/table-store';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
}

const statusColors = {
  free: 'bg-table-free/20 border-table-free hover:bg-table-free/30',
  occupied: 'bg-table-occupied/20 border-table-occupied hover:bg-table-occupied/30',
  reserved: 'bg-table-reserved/20 border-table-reserved hover:bg-table-reserved/30',
};

const statusDotColors = {
  free: 'bg-table-free',
  occupied: 'bg-table-occupied',
  reserved: 'bg-table-reserved',
};

const statusLabels = {
  free: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
};

export function TableCard({ table }: TableCardProps) {
  const { selectTable, selectedTable } = useTableStore();
  const isSelected = selectedTable?.id === table.id;
  const customerCount = table.currentCustomers.length;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectTable(table.id)}
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all duration-300 w-full text-left',
        statusColors[table.status],
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Table Number */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-serif text-2xl font-bold text-foreground">
          #{table.number}
        </span>
        <div className={cn('w-3 h-3 rounded-full', statusDotColors[table.status])} />
      </div>

      {/* Table Visual Representation */}
      <div className="relative mb-4">
        <div className={cn(
          'mx-auto rounded-lg border-2 transition-colors',
          table.capacity <= 2 ? 'w-16 h-16' : table.capacity <= 4 ? 'w-20 h-20' : 'w-24 h-24',
          table.status === 'free' ? 'border-table-free/50 bg-table-free/10' :
          table.status === 'occupied' ? 'border-table-occupied/50 bg-table-occupied/10' :
          'border-table-reserved/50 bg-table-reserved/10'
        )}>
          {/* Chairs representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid gap-1" style={{ 
              gridTemplateColumns: `repeat(${Math.min(table.capacity, 4)}, minmax(0, 1fr))` 
            }}>
              {[...Array(Math.min(table.capacity, 8))].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    i < customerCount 
                      ? statusDotColors[table.status]
                      : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{customerCount}/{table.capacity}</span>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          table.status === 'free' ? 'bg-table-free/20 text-table-free' :
          table.status === 'occupied' ? 'bg-table-occupied/20 text-table-occupied' :
          'bg-table-reserved/20 text-table-reserved'
        )}>
          {statusLabels[table.status]}
        </span>
      </div>
    </motion.button>
  );
}
