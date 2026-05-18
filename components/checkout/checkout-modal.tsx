'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, ChefHat, Truck, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useTableStore } from '@/store/table-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'select-table' | 'select-customer' | 'confirm' | 'tracking' | 'payment' | 'complete';

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const { tables, customers, orders, addCustomerToTable, createOrder, addItemToOrder, updateOrderStatus, setPaymentMethod, markOrderPaid, getTableCustomers } = useTableStore();
  
  const [step, setStep] = useState<Step>('select-table');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'preparing' | 'on-the-way' | 'delivered'>('preparing');

  const total = getTotal();
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const tableCustomers = selectedTableId ? getTableCustomers(selectedTableId) : [];
  const currentOrder = orders.find(o => o.id === currentOrderId);

  // Simulate order status progression
  useEffect(() => {
    if (step === 'tracking' && currentOrderId) {
      const timer1 = setTimeout(() => {
        setOrderStatus('on-the-way');
        updateOrderStatus(currentOrderId, 'ready');
      }, 3000);

      const timer2 = setTimeout(() => {
        setOrderStatus('delivered');
        updateOrderStatus(currentOrderId, 'delivered');
      }, 6000);

      const timer3 = setTimeout(() => {
        setStep('payment');
      }, 7500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step, currentOrderId, updateOrderStatus]);

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setStep('select-customer');
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setStep('confirm');
  };

  const handleAddNewCustomer = () => {
    if (!newCustomerName.trim() || !selectedTableId) return;
    const newCustomer = addCustomerToTable(selectedTableId, newCustomerName.trim());
    setSelectedCustomerId(newCustomer.id);
    setNewCustomerName('');
    setStep('confirm');
  };

  const handlePlaceOrder = () => {
    if (!selectedCustomerId || !selectedTableId) return;

    // Create new order
    const order = createOrder(selectedCustomerId, selectedTableId);
    setCurrentOrderId(order.id);

    // Add all cart items to order
    items.forEach(item => {
      addItemToOrder(order.id, item.product, item.quantity);
    });

    // Update status to preparing
    updateOrderStatus(order.id, 'preparing');
    
    // Clear cart and go to tracking
    clearCart();
    setStep('tracking');
  };

  const handlePayment = (method: 'cash' | 'card') => {
    if (!currentOrderId) return;
    setPaymentMethod(currentOrderId, method);
    markOrderPaid(currentOrderId);
    setStep('complete');
  };

  const handleClose = () => {
    setStep('select-table');
    setSelectedTableId(null);
    setSelectedCustomerId(null);
    setCurrentOrderId(null);
    setOrderStatus('preparing');
    onClose();
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={step === 'complete' ? handleClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-xl font-semibold">
                {step === 'select-table' && 'Selecteaza Masa'}
                {step === 'select-customer' && 'Selecteaza Clientul'}
                {step === 'confirm' && 'Confirma Comanda'}
                {step === 'tracking' && 'Status Comanda'}
                {step === 'payment' && 'Alege Plata'}
                {step === 'complete' && 'Comanda Finalizata'}
              </h2>
              {step !== 'tracking' && (
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              {/* Step 1: Select Table */}
              {step === 'select-table' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Selecteaza masa la care te afli pentru a comanda:
                  </p>
                  {occupiedTables.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nu exista mese ocupate.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Roaga un ospatar sa te aseze la o masa.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {occupiedTables.map(table => (
                        <motion.button
                          key={table.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectTable(table.id)}
                          className="p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-border hover:border-primary transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Masa {table.number}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {table.currentCustomers.length} clienti
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Select Customer */}
              {step === 'select-customer' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Selecteaza-ti numele sau adauga-te ca client nou:
                  </p>
                  
                  {/* Existing customers */}
                  {tableCustomers.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Clienti existenti:</h3>
                      {tableCustomers.map(customer => (
                        <motion.button
                          key={customer.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectCustomer(customer.id)}
                          className="w-full p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-border hover:border-primary transition-colors text-left flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Add new customer */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Sau adauga-te ca client nou:</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Introdu numele tau..."
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewCustomer()}
                      />
                      <Button onClick={handleAddNewCustomer} disabled={!newCustomerName.trim()}>
                        Adauga
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" onClick={() => setStep('select-table')}>
                    Inapoi
                  </Button>
                </div>
              )}

              {/* Step 3: Confirm Order */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedCustomer?.name}</p>
                        <p className="text-sm text-muted-foreground">Masa {selectedTable?.number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Comanda ta:</h3>
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-medium">{item.quantity}x</span>
                          <span>{item.product.name}</span>
                        </div>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('select-customer')}>
                      Inapoi
                    </Button>
                    <Button className="flex-1" onClick={handlePlaceOrder}>
                      Plaseaza Comanda
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Order Tracking */}
              {step === 'tracking' && (
                <div className="space-y-6 py-4">
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: orderStatus === 'preparing' ? 360 : 0 }}
                      transition={{ duration: 2, repeat: orderStatus === 'preparing' ? Infinity : 0, ease: 'linear' }}
                      className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      {orderStatus === 'preparing' && <ChefHat className="h-10 w-10 text-primary" />}
                      {orderStatus === 'on-the-way' && <Truck className="h-10 w-10 text-primary" />}
                      {orderStatus === 'delivered' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">
                      {orderStatus === 'preparing' && 'Se pregateste...'}
                      {orderStatus === 'on-the-way' && 'Comanda vine la tine!'}
                      {orderStatus === 'delivered' && 'Comanda a ajuns!'}
                    </h3>
                    <p className="text-muted-foreground">
                      {orderStatus === 'preparing' && 'Barista-ul nostru pregateste comanda ta cu grija.'}
                      {orderStatus === 'on-the-way' && 'Ospatarul aduce comanda la masa ta.'}
                      {orderStatus === 'delivered' && 'Pofta buna! Poti alege metoda de plata.'}
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full transition-colors ${orderStatus === 'preparing' || orderStatus === 'on-the-way' || orderStatus === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`w-16 h-1 rounded transition-colors ${orderStatus === 'on-the-way' || orderStatus === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`w-3 h-3 rounded-full transition-colors ${orderStatus === 'on-the-way' || orderStatus === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`w-16 h-1 rounded transition-colors ${orderStatus === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`w-3 h-3 rounded-full transition-colors ${orderStatus === 'delivered' ? 'bg-green-500' : 'bg-muted'}`} />
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">Comanda pentru {selectedCustomer?.name}:</p>
                    {currentOrder?.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${currentOrder?.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {step === 'payment' && (
                <div className="space-y-4 py-4">
                  <div className="text-center mb-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Comanda livrata!</h3>
                    <p className="text-muted-foreground">Alege cum doresti sa platesti:</p>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-xl mb-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total de plata</span>
                      <span className="text-primary">${currentOrder?.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePayment('card')}
                      className="p-6 bg-secondary/50 hover:bg-secondary rounded-xl border border-border hover:border-primary transition-colors flex flex-col items-center gap-3"
                    >
                      <CreditCard className="h-10 w-10 text-primary" />
                      <span className="font-medium">Card</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePayment('cash')}
                      className="p-6 bg-secondary/50 hover:bg-secondary rounded-xl border border-border hover:border-primary transition-colors flex flex-col items-center gap-3"
                    >
                      <Banknote className="h-10 w-10 text-green-500" />
                      <span className="font-medium">Cash</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 6: Complete */}
              {step === 'complete' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-2">Multumim!</h3>
                  <p className="text-muted-foreground mb-6">
                    Plata a fost procesata cu succes.
                    <br />
                    Pofta buna!
                  </p>
                  <Button onClick={handleClose} className="px-8">
                    Inchide
                  </Button>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
