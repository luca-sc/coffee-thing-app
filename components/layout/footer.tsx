import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-espresso border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Coffee className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">
                BrewMaster
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Crafting exceptional coffee experiences since 2010. Every cup tells a story of passion, quality, and dedication.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Menu', 'Tables', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>123 Coffee Street, Brew City, BC 12345</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>hello@brewmaster.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Opening Hours
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span>7:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>8:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} BrewMaster Cafe. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
