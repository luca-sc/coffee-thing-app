'use client';

import { motion } from 'framer-motion';
import { Leaf, Heart, Globe, Users } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Ethically Sourced',
    description: 'We partner directly with farmers to ensure fair trade and sustainable practices.',
  },
  {
    icon: Heart,
    title: 'Crafted with Love',
    description: 'Every cup is prepared by our skilled baristas who are passionate about coffee.',
  },
  {
    icon: Globe,
    title: 'Global Selection',
    description: 'Beans from the finest coffee regions around the world, roasted to perfection.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'A welcoming space where friends meet, ideas brew, and memories are made.',
  },
];

export function AboutSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium">Our Story</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              More Than Just Coffee
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Founded in 2010, BrewMaster began as a small coffee cart with a big dream: to bring exceptional coffee experiences to everyone. Today, we&apos;ve grown into a beloved neighborhood cafe, but our passion remains the same.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We believe that great coffee has the power to bring people together, spark creativity, and make every day a little bit better. That&apos;s why we source the finest beans, train our baristas extensively, and create a warm, inviting atmosphere for our guests.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-coffee to-espresso flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="text-center relative z-10">
                <span className="text-8xl opacity-50">☕</span>
                <p className="text-cream/80 font-serif text-2xl mt-4">Since 2010</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-caramel/20 blur-3xl" />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 border border-border shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">☕</span>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-foreground">1M+</p>
                  <p className="text-xs text-muted-foreground">Cups Served</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
