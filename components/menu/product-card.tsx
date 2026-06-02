'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { categoryLabels } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  const handleAddToOrder = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity}x ${product.name} to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => openCart(),
      },
    });
    setQuantity(1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 group shadow-sm"
    >
      {/* Product Image */}
      <div
        className="aspect-4/3 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, var(--color-cream) 0%, var(--color-coffee-light) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent mix-blend-screen" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-7xl opacity-100 drop-shadow-lg"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            ☕
          </motion.span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm">
            {categoryLabels[product.category]}
          </span>
        </div>
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-medium">
            {product.description}
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Quantity & Order Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-lg p-1 border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary-foreground hover:bg-background"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!product.available}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-secondary-foreground">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary-foreground hover:bg-background"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!product.available}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToOrder}
              disabled={!product.available}
              className="flex-1 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Add to Order
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}