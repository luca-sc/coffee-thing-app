'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, ChefHat, Utensils, CreditCard } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTableStore } from '@/store/table-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderStatusTrackerProps {
  order: Order;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: Utensils },
  { status: 'delivered', label: 'Delivered', icon: Check },
  { status: 'paid', label: 'Paid', icon: CreditCard },
];

export function OrderStatusTracker({ order }: OrderStatusTrackerProps) {
  const { updateOrderStatus } = useTableStore();
  
  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-border">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStatusChange(step.status)}
                  disabled={order.status === 'paid'}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground',
                    isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
                <span className={cn(
                  'text-xs mt-2',
                  isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.product.name}
            </span>
            <span className="text-foreground">${item.price.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
