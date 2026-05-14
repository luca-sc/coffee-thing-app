import { Product, Table, Customer, Order, AdminUser, Testimonial } from '@/types';

// Mock Products
export const mockProducts: Product[] = [
  // Coffee
  {
    id: 'prod-1',
    name: 'House Blend Coffee',
    description: 'Our signature smooth and balanced house blend with notes of chocolate and caramel',
    price: 3.50,
    category: 'coffee',
    image: '/images/products/house-blend.jpg',
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Colombian Dark Roast',
    description: 'Bold and rich dark roast from the mountains of Colombia',
    price: 4.00,
    category: 'coffee',
    image: '/images/products/colombian.jpg',
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Ethiopian Single Origin',
    description: 'Fruity and floral notes with a wine-like complexity',
    price: 4.50,
    category: 'coffee',
    image: '/images/products/ethiopian.jpg',
    available: true,
  },
  // Espresso
  {
    id: 'prod-4',
    name: 'Classic Espresso',
    description: 'Bold and concentrated shot of our finest espresso blend',
    price: 2.50,
    category: 'espresso',
    image: '/images/products/espresso.jpg',
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk foam, perfect balance of strength and creaminess',
    price: 4.50,
    category: 'espresso',
    image: '/images/products/cappuccino.jpg',
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Caramel Latte',
    description: 'Smooth espresso with steamed milk and house-made caramel syrup',
    price: 5.00,
    category: 'espresso',
    image: '/images/products/latte.jpg',
    available: true,
  },
  {
    id: 'prod-7',
    name: 'Mocha',
    description: 'Rich espresso combined with chocolate and steamed milk, topped with whipped cream',
    price: 5.50,
    category: 'espresso',
    image: '/images/products/mocha.jpg',
    available: true,
  },
  // Tea
  {
    id: 'prod-8',
    name: 'Earl Grey',
    description: 'Classic black tea with bergamot orange fragrance',
    price: 3.00,
    category: 'tea',
    image: '/images/products/earl-grey.jpg',
    available: true,
  },
  {
    id: 'prod-9',
    name: 'Green Matcha',
    description: 'Premium Japanese matcha whisked to perfection',
    price: 4.50,
    category: 'tea',
    image: '/images/products/matcha.jpg',
    available: true,
  },
  {
    id: 'prod-10',
    name: 'Chamomile Honey',
    description: 'Calming chamomile tea with a touch of local honey',
    price: 3.50,
    category: 'tea',
    image: '/images/products/chamomile.jpg',
    available: true,
  },
  // Desserts
  {
    id: 'prod-11',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
    price: 6.50,
    category: 'desserts',
    image: '/images/products/tiramisu.jpg',
    available: true,
  },
  {
    id: 'prod-12',
    name: 'Chocolate Cake',
    description: 'Rich and decadent three-layer chocolate cake',
    price: 5.50,
    category: 'desserts',
    image: '/images/products/chocolate-cake.jpg',
    available: true,
  },
  {
    id: 'prod-13',
    name: 'Cheesecake',
    description: 'Creamy New York style cheesecake with berry compote',
    price: 6.00,
    category: 'desserts',
    image: '/images/products/cheesecake.jpg',
    available: true,
  },
  {
    id: 'prod-14',
    name: 'Croissant',
    description: 'Buttery, flaky French pastry baked fresh daily',
    price: 3.50,
    category: 'desserts',
    image: '/images/products/croissant.jpg',
    available: true,
  },
  // Cold Drinks
  {
    id: 'prod-15',
    name: 'Iced Americano',
    description: 'Refreshing espresso over ice with cold water',
    price: 4.00,
    category: 'cold-drinks',
    image: '/images/products/iced-americano.jpg',
    available: true,
  },
  {
    id: 'prod-16',
    name: 'Cold Brew',
    description: '18-hour steeped cold brew with smooth, low-acidity flavor',
    price: 4.50,
    category: 'cold-drinks',
    image: '/images/products/cold-brew.jpg',
    available: true,
  },
  {
    id: 'prod-17',
    name: 'Iced Mocha Frappe',
    description: 'Blended iced coffee with chocolate and whipped cream',
    price: 5.50,
    category: 'cold-drinks',
    image: '/images/products/frappe.jpg',
    available: true,
  },
  {
    id: 'prod-18',
    name: 'Fresh Lemonade',
    description: 'House-made lemonade with fresh lemons and mint',
    price: 3.50,
    category: 'cold-drinks',
    image: '/images/products/lemonade.jpg',
    available: true,
  },
  // Breakfast
  {
    id: 'prod-19',
    name: 'Avocado Toast',
    description: 'Sourdough toast with smashed avocado, cherry tomatoes, and poached egg',
    price: 9.00,
    category: 'breakfast',
    image: '/images/products/avocado-toast.jpg',
    available: true,
  },
  {
    id: 'prod-20',
    name: 'Belgian Waffle',
    description: 'Crispy waffle with maple syrup, fresh berries, and whipped cream',
    price: 8.50,
    category: 'breakfast',
    image: '/images/products/waffle.jpg',
    available: true,
  },
  {
    id: 'prod-21',
    name: 'Eggs Benedict',
    description: 'Poached eggs on English muffin with hollandaise and smoked salmon',
    price: 12.00,
    category: 'breakfast',
    image: '/images/products/eggs-benedict.jpg',
    available: true,
  },
  {
    id: 'prod-22',
    name: 'Granola Bowl',
    description: 'House-made granola with Greek yogurt, honey, and seasonal fruits',
    price: 7.50,
    category: 'breakfast',
    image: '/images/products/granola.jpg',
    available: true,
  },
];

// Mock Tables - toate libere la inceput
export const mockTables: Table[] = [
  { id: 'table-1', number: 1, capacity: 2, status: 'free', currentCustomers: [] },
  { id: 'table-2', number: 2, capacity: 2, status: 'free', currentCustomers: [] },
  { id: 'table-3', number: 3, capacity: 4, status: 'free', currentCustomers: [] },
  { id: 'table-4', number: 4, capacity: 4, status: 'reserved', currentCustomers: [] },
  { id: 'table-5', number: 5, capacity: 6, status: 'free', currentCustomers: [] },
  { id: 'table-6', number: 6, capacity: 2, status: 'free', currentCustomers: [] },
  { id: 'table-7', number: 7, capacity: 4, status: 'free', currentCustomers: [] },
  { id: 'table-8', number: 8, capacity: 8, status: 'free', currentCustomers: [] },
  { id: 'table-9', number: 9, capacity: 2, status: 'reserved', currentCustomers: [] },
  { id: 'table-10', number: 10, capacity: 4, status: 'free', currentCustomers: [] },
  { id: 'table-11', number: 11, capacity: 6, status: 'free', currentCustomers: [] },
  { id: 'table-12', number: 12, capacity: 2, status: 'free', currentCustomers: [] },
];

// Mock Customers - gol la inceput
export const mockCustomers: Customer[] = [];

// Mock Orders - gol la inceput
export const mockOrders: Order[] = [];

// Mock Admin User
export const mockAdminUser: AdminUser = {
  id: 'admin-1',
  email: 'admin@brewmaster.com',
  name: 'Admin User',
  role: 'admin',
};

// Mock Testimonials
export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Sarah Mitchell',
    role: 'Coffee Enthusiast',
    content: 'The best coffee I have ever had! The atmosphere is cozy and the staff is incredibly friendly. This has become my go-to spot for morning coffee.',
    rating: 5,
    avatar: '/images/avatars/avatar-1.jpg',
  },
  {
    id: 'test-2',
    name: 'James Anderson',
    role: 'Food Blogger',
    content: 'Exceptional quality in every cup. Their single-origin Ethiopian is a must-try. The breakfast menu is equally impressive.',
    rating: 5,
    avatar: '/images/avatars/avatar-2.jpg',
  },
  {
    id: 'test-3',
    name: 'Emily Chen',
    role: 'Local Artist',
    content: 'Perfect place to work and get inspired. The ambiance is just right, not too loud, great WiFi, and amazing pastries!',
    rating: 5,
    avatar: '/images/avatars/avatar-3.jpg',
  },
];

// Category labels for display
export const categoryLabels: Record<string, string> = {
  'coffee': 'Coffee',
  'espresso': 'Espresso',
  'tea': 'Tea',
  'desserts': 'Desserts',
  'cold-drinks': 'Cold Drinks',
  'breakfast': 'Breakfast',
};
