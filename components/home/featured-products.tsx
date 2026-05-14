'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProducts, categoryLabels } from '@/data/mock-data';

const featuredProducts = mockProducts.slice(0, 6);

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium">Our Selection</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Featured Favorites
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most beloved creations, crafted with passion and the finest ingredients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-coffee/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-50">☕</span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                    {categoryLabels[product.category]}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/menu">Order Now</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/menu">
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
