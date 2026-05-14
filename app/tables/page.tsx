'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { TablesGrid } from '@/components/tables/tables-grid';
import { TableSessionPanel } from '@/components/tables/table-session-panel';

export default function TablesPage() {
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
            <span className="text-primary font-medium">Table Management</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              Restaurant Floor
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select a table to start a new session or manage existing customers. Each customer can have their own orders and payments.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tables Grid */}
            <div className="lg:col-span-2">
              <TablesGrid />
            </div>

            {/* Session Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TableSessionPanel />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
