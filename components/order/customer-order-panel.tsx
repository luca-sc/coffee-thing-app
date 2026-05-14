'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, Banknote, Check, ArrowLeft } from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { mockProducts, categoryLabels } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Product, ProductCategory, PaymentMethod } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerOrderPanelProps {
  customerId: string;
  onClose: () => void;
}

export function CustomerOrderPanel({ customerId, onClose }: CustomerOrderPanelProps) {
  const {
    customers,
    getCustomerOrders,
    createOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderStatus,
    setPaymentMethod,
    markOrderPaid,
  } = useTableStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [localCart, setLocalCart] = useState<{ product: Product; quantity: number }[]>([]);

  const customer = customers.find(c => c.id === customerId);
  const orders = getCustomerOrders(customerId);
  const activeOrder = orders.find(o => o.status !== 'paid');

  if (!customer) return null;

  const filteredProducts = mockProducts.filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  );

  const cartTotal = localCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setLocalCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setLocalCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setLocalCart(prev =>
      prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const handleSubmitOrder = () => {
    if (localCart.length === 0) {
      toast.error('Add items to cart first');
      return;
    }

    // Create a new order or use existing active order
    let orderId = activeOrder?.id;
    if (!orderId) {
      const newOrder = createOrder(customerId, customer.tableId);
      orderId = newOrder.id;
    }

    // Add items to order
    localCart.forEach(item => {
      addItemToOrder(orderId!, item.product, item.quantity);
    });

    setLocalCart([]);
    toast.success('Order submitted successfully!');
  };

  const categories: (ProductCategory | 'all')[] = ['all', 'coffee', 'espresso', 'tea', 'desserts', 'cold-drinks', 'breakfast'];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-serif text-xl font-semibold">{customer.name}&apos;s Order</h2>
            <p className="text-sm text-muted-foreground">Table #{customer.tableId.replace('table-', '')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Filters */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All' : categoryLabels[cat]}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const cartItem = localCart.find(i => i.product.id === product.id);
                return (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(product)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      cartItem ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center text-3xl">
                      ☕
                    </div>
                    <h4 className="font-medium text-sm text-foreground line-clamp-1">{product.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-primary font-semibold">${product.price.toFixed(2)}</span>
                      {cartItem && (
                        <Badge variant="secondary" className="text-xs">
                          x{cartItem.quantity}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Cart & Orders Sidebar */}
        <div className="w-80 border-l border-border flex flex-col bg-card">
          {/* Current Cart */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Current Cart
              </h3>
              {localCart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocalCart([])}
                  className="text-destructive text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {localCart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tap products to add to cart
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {localCart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground">{item.product.name}</p>
                      <p className="text-muted-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {localCart.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between mb-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-primary">${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full" onClick={handleSubmitOrder}>
                  Submit Order
                </Button>
              </div>
            )}
          </div>

          {/* Previous Orders */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <h3 className="font-semibold mb-3">Order History</h3>
            <ScrollArea className="flex-1">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          order.status === 'paid' ? 'default' :
                          order.status === 'ready' || order.status === 'delivered' ? 'secondary' :
                          'outline'
                        }>
                          {order.status}
                        </Badge>
                        <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
                      </div>

                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}

                      {order.paymentStatus !== 'paid' && (
                        <div className="pt-2 border-t border-border space-y-2">
                          {!order.paymentMethod ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setPaymentMethod(order.id, 'cash')}
                              >
                                <Banknote className="h-3 w-3 mr-1" />
                                Cash
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setPaymentMethod(order.id, 'card')}
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Card
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                markOrderPaid(order.id);
                                toast.success('Payment confirmed!');
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Confirm Payment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
