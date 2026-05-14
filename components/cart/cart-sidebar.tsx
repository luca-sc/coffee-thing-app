'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { CheckoutModal } from '@/components/checkout/checkout-modal';

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  const total = getTotal();

  const handleOrderAtTable = () => {
    closeCart();
    setShowCheckout(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={closeCart}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="font-serif text-xl font-semibold">Comanda Ta</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={closeCart}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Cosul tau e gol. Adauga ceva delicios!
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/menu">Vezi Meniul</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex gap-4 p-3 bg-secondary/50 rounded-lg"
                        >
                          {/* Product Image Placeholder */}
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">☕</span>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ${item.product.price.toFixed(2)} fiecare
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Price & Remove */}
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-primary">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="p-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-lg">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearCart}
                      >
                        Goleste
                      </Button>
                      <Button className="flex-1" onClick={handleOrderAtTable}>
                        Comanda la Masa
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </>
  );
}
