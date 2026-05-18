'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { mockTestimonials } from '@/data/mock-data';

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium">Testimonials</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our beloved customers have to say about their BrewMaster experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
