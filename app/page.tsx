import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { AboutSection } from '@/components/home/about-section';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <AboutSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
