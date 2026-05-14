// Product Types
export type ProductCategory = 
  | 'coffee' 
  | 'espresso' 
  | 'tea' 
  | 'desserts' 
  | 'cold-drinks' 
  | 'breakfast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
}

// Table Types
export type TableStatus = 'free' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentCustomers: string[];
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  tableId: string;
  orders: Order[];
  createdAt: string;
}

// Order Types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
export type PaymentMethod = 'cash' | 'card' | null;
export type PaymentStatus = 'unpaid' | 'pending' | 'paid';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Statistics Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  occupiedTables: number;
  recentOrders: Order[];
  revenueByCategory: { category: string; revenue: number }[];
}

// Testimonial Type
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}
