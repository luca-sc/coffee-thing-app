'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClientAnimatedBeans } from './client-animated-beans';
import Link from 'next/link';
import { ArrowRight, Coffee, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background cu overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-background to-coffee-dark" />
      
      {/* ========================================================
         BULE ANIMATE ULTRA-INTENSE (ORBS) - EFFECT WOW DEFINITIV
         ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Proiectorul Principal 1: Poziționat FIX în centrul ecranului, extrem de luminos (Auriu/Cream) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-cream/40 dark:bg-cream/35 blur-[60px] animate-bounce duration-[10s] ease-in-out infinite" />
        
        {/* Proiectorul Auxiliar 2: Caramel vibrant care dansează pe diagonală pentru a sparge monotonia */}
        <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] rounded-full bg-caramel/45 dark:bg-caramel/35 blur-[70px] animate-pulse duration-[6s] ease-in-out infinite" />
        
        {/* Proiectorul Auxiliar 3: O pată caldă în zona de butoane/statistici */}
        <div className="absolute bottom-[20%] right-[20%] w-[450px] h-[300px] rounded-full bg-primary/35 dark:bg-primary/25 blur-[80px] animate-pulse duration-[8s] ease-in-out infinite" />
      </div>

      {/* Animated coffee beans decoration */}
      <ClientAnimatedBeans />

      {/* Content - Z-10 ridică textul curat deasupra luminilor */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Coffee className="h-4 w-4" />
              Premium Artisan Coffee
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance"
          >
            Where Every Sip Tells a{' '}
            <span className="text-primary">Story</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
          >
            Experience the finest artisan coffee crafted with passion. From single-origin beans to signature blends, every cup is a journey of flavor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/menu">
                Explore Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/tables">Reserve a Table</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: Coffee, value: '50+', label: 'Coffee Varieties' },
              { icon: Clock, value: '14+', label: 'Years of Excellence' },
              { icon: Award, value: '10K+', label: 'Happy Customers' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-serif text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}