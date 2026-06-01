 'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Check,
  ArrowLeft
} from 'lucide-react';

import { categoryLabels } from '@/lib/constants';
import { Product, ProductCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { authHeaders } from '@/lib/api';

interface Props {
  customerId: string;
  tableId: string;
  customerName: string;
  onClose: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// load products from backend


export function CustomerOrderPanel({
  customerId,
  tableId,
  customerName,
  onClose
}: Props) {

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | 'all'>('all');

  const [localCart, setLocalCart] = useState<
    { product: Product; quantity: number }[]
  >([]);

  const [orders, setOrders] = useState<any[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.data)) setProducts(data.data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = products.filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  );

  const cartTotal = localCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // ================= CART =================

  const addToCart = (product: Product) => {
    setLocalCart(prev => {
      const found = prev.find(p => p.product.id === product.id);

      if (found) {
        return prev.map(p =>
          p.product.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setLocalCart(prev =>
      prev
        .map(p =>
          p.product.id === id
            ? { ...p, quantity: Math.max(0, p.quantity + delta) }
            : p
        )
        .filter(p => p.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setLocalCart(prev => prev.filter(p => p.product.id !== id));
  };

  // ================= CREATE ORDER (MYSQL) =================

  const submitOrder = async () => {
    if (localCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          customerId,
          tableId,
          items: localCart.map(i => ({
            productId: i.product.id,
            quantity: i.quantity
          }))
        })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Order failed");
        return;
      }

      setOrders(prev => [...prev, data.data]);
      setLocalCart([]);

      toast.success("Order saved to MySQL ✅");
    } catch (err) {
      toast.error("Server error");
    }
  };

  // ================= PAYMENT =================

  const setPayment = async (orderId: string, method: string) => {
    await fetch(`${API}/api/orders/${orderId}/payment-method`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ method })
    });

    toast.success("Payment method set");
  };

  const payOrder = async (orderId: string) => {
    await fetch(`${API}/api/orders/${orderId}/pay`, {
      method: "PUT",
      headers: authHeaders(false)
    });

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, paymentStatus: "paid" } : o
      )
    );

    toast.success("Paid successfully");
  };

  // ================= UI =================

  const categories: (ProductCategory | 'all')[] = [
    'all',
    'coffee',
    'espresso',
    'tea',
    'desserts',
    'cold-drinks',
    'breakfast'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between">
        <div>
          <h2 className="font-bold text-xl">{customerName}</h2>
          <p className="text-sm text-muted-foreground">
            Table #{tableId.replace('table-', '')}
          </p>
        </div>

        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* PRODUCTS */}
        <div className="flex-1 p-4 overflow-hidden">

          <div className="flex gap-2 mb-3 flex-wrap">
            {categories.map(c => (
              <Button
                key={c}
                size="sm"
                variant={selectedCategory === c ? "default" : "outline"}
                onClick={() => setSelectedCategory(c)}
              >
                {c === "all" ? "All" : categoryLabels[c]}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 gap-3">

              {filteredProducts.map(p => (
                <motion.div
                  key={p.id}
                  whileTap={{ scale: 0.95 }}
                  className="border p-3 rounded cursor-pointer"
                  onClick={() => addToCart(p)}
                >
                  <div className="text-lg">☕</div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-primary">${p.price}</div>
                </motion.div>
              ))}

            </div>
          </ScrollArea>
        </div>

        {/* CART */}
        <div className="w-80 border-l p-4 flex flex-col">

          <h3 className="font-bold mb-2 flex items-center gap-2">
            <ShoppingBag /> Cart
          </h3>

          {localCart.map(i => (
            <div key={i.product.id} className="flex justify-between mb-2">
              <div>
                {i.product.name} x{i.quantity}
              </div>

              <div className="flex gap-1">
                <Button size="icon" onClick={() => updateQty(i.product.id, -1)}>
                  <Minus />
                </Button>

                <Button size="icon" onClick={() => updateQty(i.product.id, 1)}>
                  <Plus />
                </Button>

                <Button size="icon" onClick={() => removeItem(i.product.id)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-auto">
            <div className="mb-2">
              Total: ${cartTotal.toFixed(2)}
            </div>

            <Button className="w-full" onClick={submitOrder}>
              Submit Order
            </Button>
          </div>

          {/* ORDERS */}
          <div className="mt-4">
            <h4 className="font-bold">Orders</h4>

            {orders.map(o => (
              <div key={o.id} className="border p-2 mt-2">

                <Badge>{o.status}</Badge>

                <div className="text-sm">
                  ${o.total}
                </div>

                {o.paymentStatus !== "paid" && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => setPayment(o.id, "cash")}>
                      Cash
                    </Button>

                    <Button size="sm" onClick={() => setPayment(o.id, "card")}>
                      Card
                    </Button>

                    <Button size="sm" onClick={() => payOrder(o.id)}>
                      <Check /> Pay
                    </Button>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}