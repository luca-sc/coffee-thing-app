'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCategory } from '@/types';
import { categoryLabels } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface MenuFiltersProps {
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories: (ProductCategory | 'all')[] = [
  'all',
  'coffee',
  'espresso',
  'tea',
  'desserts',
  'cold-drinks',
  'breakfast',
];

const categoryIcons: Record<string, string> = {
  all: '🍽️',
  coffee: '☕',
  espresso: '🫖',
  tea: '🍵',
  desserts: '🍰',
  'cold-drinks': '🧊',
  breakfast: '🍳',
};

export function MenuFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: MenuFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
          isSearchFocused ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="pl-10 pr-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onSearchChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-border/40",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <span>{categoryIcons[category]}</span>
            <span>{category === 'all' ? 'All Items' : categoryLabels[category]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}