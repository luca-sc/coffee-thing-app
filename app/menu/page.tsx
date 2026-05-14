'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { MenuGrid } from '@/components/menu/menu-grid';

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-primary font-medium">Our Selection</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              Explore Our Menu
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From rich espressos to delightful pastries, discover the perfect combination for your taste.
            </p>
          </motion.div>

          {/* Menu Grid */}
          <MenuGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
