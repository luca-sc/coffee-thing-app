'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee } from 'lucide-react';
// products are loaded from backend API
import { ProductCategory, Product } from '@/types';
import { MenuFilters } from './menu-filters';
import { ProductCard } from './product-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function MenuGrid() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // backend returns { success: true, data: [...] }
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.data)) setProducts(data.data);
      })
      .catch(() => {
        // keep products empty on error
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  return (
    <div className="space-y-8">
      <MenuFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results count */}
      <div className="text-center text-muted-foreground text-sm">
        Showing {filteredProducts.length} of {products.length} items
      </div>
    </div>
  );
}
