'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { Order, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTableStore } from '@/store/table-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ order, isOpen, onClose }: PaymentModalProps) {
  const { setPaymentMethod, markOrderPaid } = useTableStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPaymentMethod(order.id, selectedMethod);
    markOrderPaid(order.id);

    setIsProcessing(false);
    setSelectedMethod(null);
    
    toast.success('Payment confirmed successfully!', {
      description: `$${order.total.toFixed(2)} paid via ${selectedMethod}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Complete Payment</DialogTitle>
          <DialogDescription>
            Choose a payment method to complete the order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Summary */}
          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
            <h4 className="font-medium text-foreground">Order Summary</h4>
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="text-foreground">${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border font-semibold">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm">Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod('cash')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                  selectedMethod === 'cash'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Banknote className={cn(
                  'h-8 w-8',
                  selectedMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'font-medium',
                  selectedMethod === 'cash' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  Cash
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod('card')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                  selectedMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <CreditCard className={cn(
                  'h-8 w-8',
                  selectedMethod === 'card' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'font-medium',
                  selectedMethod === 'card' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  Card
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
