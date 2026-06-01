'use client';

import { useEffect } from 'react';
import { useTableStore } from '@/store/table-store';

export function InitData() {
  const loadInitialData = useTableStore((s) => s.loadInitialData);

  useEffect(() => {
    loadInitialData();
    const id = setInterval(loadInitialData, 5000);
    return () => clearInterval(id);
  }, [loadInitialData]);

  return null;
}
