"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ClientAnimatedBeans() {
  const [mounted, setMounted] = useState(false);
  const [seeds, setSeeds] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    // generate deterministic seeds once on client
    setSeeds(Array.from({ length: 20 }, () => Math.random()));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {seeds.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          initial={{ x: `${s * 100}%`, y: -20, opacity: 0.3 }}
          animate={{ y: '120vh', rotate: 360 }}
          transition={{ duration: s * 10 + 15, repeat: Infinity, ease: 'linear', delay: s * 5 }}
        />
      ))}
    </div>
  );
}
