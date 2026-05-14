import { Product, Table, Customer, Order, AdminUser } from '../../types';

// Generate unique IDs
export const generateId = (prefix: string) => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock Products Database
export const products: Product[] = [
  // Coffee
  { id: 'prod-1', name: 'House Blend Coffee', description: 'Our signature smooth and balanced house blend', price: 3.50, category: 'coffee', image: '/images/products/house-blend.jpg', available: true },
  { id: 'prod-2', name: 'Colombian Dark Roast', description: 'Bold and rich dark roast from Colombia', price: 4.00, category: 'coffee', image: '/images/products/colombian.jpg', available: true },
  { id: 'prod-3', name: 'Ethiopian Single Origin', description: 'Fruity and floral notes', price: 4.50, category: 'coffee', image: '/images/products/ethiopian.jpg', available: true },
  // Espresso
  { id: 'prod-4', name: 'Classic Espresso', description: 'Bold and concentrated shot', price: 2.50, category: 'espresso', image: '/images/products/espresso.jpg', available: true },
  { id: 'prod-5', name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, category: 'espresso', image: '/images/products/cappuccino.jpg', available: true },
  { id: 'prod-6', name: 'Caramel Latte', description: 'Smooth espresso with caramel', price: 5.00, category: 'espresso', image: '/images/products/latte.jpg', available: true },
  { id: 'prod-7', name: 'Mocha', description: 'Espresso with chocolate and milk', price: 5.50, category: 'espresso', image: '/images/products/mocha.jpg', available: true },
  // Tea
  { id: 'prod-8', name: 'Earl Grey', description: 'Classic black tea with bergamot', price: 3.00, category: 'tea', image: '/images/products/earl-grey.jpg', available: true },
  { id: 'prod-9', name: 'Green Matcha', description: 'Premium Japanese matcha', price: 4.50, category: 'tea', image: '/images/products/matcha.jpg', available: true },
  { id: 'prod-10', name: 'Chamomile Honey', description: 'Calming chamomile with honey', price: 3.50, category: 'tea', image: '/images/products/chamomile.jpg', available: true },
  // Desserts
  { id: 'prod-11', name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.50, category: 'desserts', image: '/images/products/tiramisu.jpg', available: true },
  { id: 'prod-12', name: 'Chocolate Cake', description: 'Rich three-layer chocolate cake', price: 5.50, category: 'desserts', image: '/images/products/chocolate-cake.jpg', available: true },
  { id: 'prod-13', name: 'Cheesecake', description: 'New York style cheesecake', price: 6.00, category: 'desserts', image: '/images/products/cheesecake.jpg', available: true },
  { id: 'prod-14', name: 'Croissant', description: 'Buttery French pastry', price: 3.50, category: 'desserts', image: '/images/products/croissant.jpg', available: true },
  // Cold Drinks
  { id: 'prod-15', name: 'Iced Americano', description: 'Espresso over ice', price: 4.00, category: 'cold-drinks', image: '/images/products/iced-americano.jpg', available: true },
  { id: 'prod-16', name: 'Cold Brew', description: '18-hour steeped cold brew', price: 4.50, category: 'cold-drinks', image: '/images/products/cold-brew.jpg', available: true },
  { id: 'prod-17', name: 'Iced Mocha Frappe', description: 'Blended iced coffee with chocolate', price: 5.50, category: 'cold-drinks', image: '/images/products/frappe.jpg', available: true },
  { id: 'prod-18', name: 'Fresh Lemonade', description: 'House-made lemonade', price: 3.50, category: 'cold-drinks', image: '/images/products/lemonade.jpg', available: true },
  // Breakfast
  { id: 'prod-19', name: 'Avocado Toast', description: 'Sourdough with avocado and egg', price: 9.00, category: 'breakfast', image: '/images/products/avocado-toast.jpg', available: true },
  { id: 'prod-20', name: 'Belgian Waffle', description: 'Crispy waffle with berries', price: 8.50, category: 'breakfast', image: '/images/products/waffle.jpg', available: true },
  { id: 'prod-21', name: 'Eggs Benedict', description: 'Poached eggs with hollandaise', price: 12.00, category: 'breakfast', image: '/images/products/eggs-benedict.jpg', available: true },
  { id: 'prod-22', name: 'Granola Bowl', description: 'Granola with yogurt and fruits', price: 7.50, category: 'breakfast', image: '/images/products/granola.jpg', available: true },
];

// Mock Tables Database
export const tables: Table[] = [
  { id: 'table-1', number: 1, capacity: 2, status: 'free', currentCustomers: [] },
  { id: 'table-2', number: 2, capacity: 2, status: 'occupied', currentCustomers: ['cust-1', 'cust-2'] },
  { id: 'table-3', number: 3, capacity: 4, status: 'free', currentCustomers: [] },
  { id: 'table-4', number: 4, capacity: 4, status: 'reserved', currentCustomers: [] },
  { id: 'table-5', number: 5, capacity: 6, status: 'occupied', currentCustomers: ['cust-3'] },
  { id: 'table-6', number: 6, capacity: 2, status: 'free', currentCustomers: [] },
  { id: 'table-7', number: 7, capacity: 4, status: 'occupied', currentCustomers: ['cust-4', 'cust-5', 'cust-6'] },
  { id: 'table-8', number: 8, capacity: 8, status: 'free', currentCustomers: [] },
  { id: 'table-9', number: 9, capacity: 2, status: 'reserved', currentCustomers: [] },
  { id: 'table-10', number: 10, capacity: 4, status: 'free', currentCustomers: [] },
  { id: 'table-11', number: 11, capacity: 6, status: 'free', currentCustomers: [] },
  { id: 'table-12', number: 12, capacity: 2, status: 'occupied', currentCustomers: ['cust-7'] },
];

// Mock Customers Database
export const customers: Customer[] = [
  { id: 'cust-1', name: 'Customer A', tableId: 'table-2', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-2', name: 'Customer B', tableId: 'table-2', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-3', name: 'Customer C', tableId: 'table-5', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-4', name: 'Customer A', tableId: 'table-7', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-5', name: 'Customer B', tableId: 'table-7', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-6', name: 'Customer C', tableId: 'table-7', orders: [], createdAt: new Date().toISOString() },
  { id: 'cust-7', name: 'Solo Customer', tableId: 'table-12', orders: [], createdAt: new Date().toISOString() },
];

// Mock Orders Database
export const orders: Order[] = [
  {
    id: 'order-1',
    customerId: 'cust-1',
    tableId: 'table-2',
    items: [
      { id: 'item-1', productId: 'prod-5', product: products.find(p => p.id === 'prod-5')!, quantity: 1, price: 4.50 },
      { id: 'item-2', productId: 'prod-11', product: products.find(p => p.id === 'prod-11')!, quantity: 1, price: 6.50 },
    ],
    status: 'delivered',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    subtotal: 11.00,
    total: 11.00,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    customerId: 'cust-2',
    tableId: 'table-2',
    items: [
      { id: 'item-3', productId: 'prod-8', product: products.find(p => p.id === 'prod-8')!, quantity: 1, price: 3.00 },
    ],
    status: 'ready',
    paymentMethod: null,
    paymentStatus: 'unpaid',
    subtotal: 3.00,
    total: 3.00,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-3',
    customerId: 'cust-4',
    tableId: 'table-7',
    items: [
      { id: 'item-4', productId: 'prod-1', product: products.find(p => p.id === 'prod-1')!, quantity: 1, price: 3.50 },
      { id: 'item-5', productId: 'prod-12', product: products.find(p => p.id === 'prod-12')!, quantity: 1, price: 5.50 },
    ],
    status: 'delivered',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    subtotal: 9.00,
    total: 9.00,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Admin Users
export const adminUsers: AdminUser[] = [
  { id: 'admin-1', email: 'admin@brewmaster.com', name: 'Admin User', role: 'admin' },
];

// Mock credentials (in real app, passwords would be hashed)
export const adminCredentials = {
  'admin@brewmaster.com': 'admin123',
};
