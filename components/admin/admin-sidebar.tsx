'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Coffee,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tables', label: 'Tables', icon: UtensilsCrossed },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-sidebar-primary" />
          {!isCollapsed && (
            <span className="font-serif text-xl font-bold text-sidebar-foreground">
              BrewMaster
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent',
            isCollapsed && 'justify-center'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-sidebar-accent border border-sidebar-border"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn(
            'h-4 w-4 transition-transform',
            isCollapsed && 'rotate-180'
          )} />
        </Button>
      </aside>
    </>
  );
}
