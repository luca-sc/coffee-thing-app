'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const categoryLabels: Record<string, string> = {
  coffee: 'Coffee',
  espresso: 'Espresso',
  tea: 'Tea',
  desserts: 'Desserts',
  'cold-drinks': 'Cold Drinks',
  breakfast: 'Breakfast',
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);

      const data = await res.json();

      if (data.success) {
        setProducts(data.data.slice(0, 6));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium">
            Our Selection
          </span>

          <h2 className="text-4xl font-bold mt-2 mb-4">
            Featured Favorites
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most beloved creations.
          </p>
        </motion.div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border rounded-xl p-5"
            >
              <div className="text-5xl mb-2">☕</div>

              <h3 className="text-xl font-semibold">
                {product.name}
              </h3>

              <p className="text-sm text-muted-foreground mb-3">
                {product.description}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-primary font-bold text-xl">
                  ${Number(product.price).toFixed(2)}
                </span>

                <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                  {categoryLabels[product.category] ??
                    product.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BUTTON */}
        <div className="text-center mt-10">
          <Button asChild>
            <Link href="/menu">
              View Full Menu
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}