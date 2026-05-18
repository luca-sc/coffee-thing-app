const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// In-memory database
const db = {
  products: [
    { id: 'prod-1', name: 'House Blend Coffee', description: 'Our signature smooth and balanced house blend', price: 3.50, category: 'coffee', image: '/images/products/house-blend.jpg', available: true },
    { id: 'prod-2', name: 'Colombian Dark Roast', description: 'Bold and rich dark roast from Colombia', price: 4.00, category: 'coffee', image: '/images/products/colombian.jpg', available: true },
    { id: 'prod-3', name: 'Ethiopian Single Origin', description: 'Fruity and floral notes', price: 4.50, category: 'coffee', image: '/images/products/ethiopian.jpg', available: true },
    { id: 'prod-4', name: 'Classic Espresso', description: 'Bold concentrated shot', price: 2.50, category: 'espresso', image: '/images/products/espresso.jpg', available: true },
    { id: 'prod-5', name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, category: 'espresso', image: '/images/products/cappuccino.jpg', available: true },
    { id: 'prod-6', name: 'Caramel Latte', description: 'Smooth espresso with caramel', price: 5.00, category: 'espresso', image: '/images/products/latte.jpg', available: true },
    { id: 'prod-7', name: 'Mocha', description: 'Espresso with chocolate and milk', price: 5.50, category: 'espresso', image: '/images/products/mocha.jpg', available: true },
    { id: 'prod-8', name: 'Earl Grey', description: 'Classic black tea with bergamot', price: 3.00, category: 'tea', image: '/images/products/earl-grey.jpg', available: true },
    { id: 'prod-9', name: 'Green Matcha', description: 'Premium Japanese matcha', price: 4.50, category: 'tea', image: '/images/products/matcha.jpg', available: true },
    { id: 'prod-10', name: 'Chamomile Honey', description: 'Calming chamomile tea', price: 3.50, category: 'tea', image: '/images/products/chamomile.jpg', available: true },
    { id: 'prod-11', name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.50, category: 'desserts', image: '/images/products/tiramisu.jpg', available: true },
    { id: 'prod-12', name: 'Chocolate Cake', description: 'Rich three-layer chocolate cake', price: 5.50, category: 'desserts', image: '/images/products/chocolate-cake.jpg', available: true },
    { id: 'prod-13', name: 'Cheesecake', description: 'New York style cheesecake', price: 6.00, category: 'desserts', image: '/images/products/cheesecake.jpg', available: true },
    { id: 'prod-14', name: 'Croissant', description: 'Buttery French pastry', price: 3.50, category: 'desserts', image: '/images/products/croissant.jpg', available: true },
    { id: 'prod-15', name: 'Iced Americano', description: 'Espresso over ice', price: 4.00, category: 'cold-drinks', image: '/images/products/iced-americano.jpg', available: true },
    { id: 'prod-16', name: 'Cold Brew', description: '18-hour steeped cold brew', price: 4.50, category: 'cold-drinks', image: '/images/products/cold-brew.jpg', available: true },
    { id: 'prod-17', name: 'Iced Mocha Frappe', description: 'Blended iced coffee with chocolate', price: 5.50, category: 'cold-drinks', image: '/images/products/frappe.jpg', available: true },
    { id: 'prod-18', name: 'Fresh Lemonade', description: 'House-made lemonade', price: 3.50, category: 'cold-drinks', image: '/images/products/lemonade.jpg', available: true },
    { id: 'prod-19', name: 'Avocado Toast', description: 'Sourdough with avocado and egg', price: 9.00, category: 'breakfast', image: '/images/products/avocado-toast.jpg', available: true },
    { id: 'prod-20', name: 'Belgian Waffle', description: 'Crispy waffle with berries', price: 8.50, category: 'breakfast', image: '/images/products/waffle.jpg', available: true },
    { id: 'prod-21', name: 'Eggs Benedict', description: 'Poached eggs with hollandaise', price: 12.00, category: 'breakfast', image: '/images/products/eggs-benedict.jpg', available: true },
    { id: 'prod-22', name: 'Granola Bowl', description: 'Granola with yogurt and fruits', price: 7.50, category: 'breakfast', image: '/images/products/granola.jpg', available: true },
  ],
  tables: [
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
  ],
  customers: [],
  orders: [],
};

// Helper function to generate IDs
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ PRODUCTS ROUTES ============
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let products = db.products;
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  res.json({ success: true, data: products });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  res.json({ success: true, data: product });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category, image } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  const newProduct = {
    id: generateId('prod'),
    name,
    description: description || '',
    price: parseFloat(price),
    category,
    image: image || '/images/products/default.jpg',
    available: true,
  };
  
  db.products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  db.products[index] = { ...db.products[index], ...req.body };
  res.json({ success: true, data: db.products[index] });
});

app.delete('/api/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  db.products.splice(index, 1);
  res.json({ success: true, message: 'Product deleted' });
});

// ============ TABLES ROUTES ============
app.get('/api/tables', (req, res) => {
  res.json({ success: true, data: db.tables });
});

app.get('/api/tables/:id', (req, res) => {
  const table = db.tables.find(t => t.id === req.params.id);
  
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  
  const customers = db.customers.filter(c => c.tableId === table.id);
  res.json({ success: true, data: { ...table, customers } });
});

app.put('/api/tables/:id/status', (req, res) => {
  const { status } = req.body;
  const table = db.tables.find(t => t.id === req.params.id);
  
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  
  if (!['free', 'occupied', 'reserved'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  
  table.status = status;
  if (status === 'free') {
    // Remove all customers from table
    db.customers = db.customers.filter(c => c.tableId !== table.id);
    table.currentCustomers = [];
  }
  
  res.json({ success: true, data: table });
});

// ============ CUSTOMERS ROUTES ============
app.get('/api/customers', (req, res) => {
  const { tableId } = req.query;
  let customers = db.customers;
  
  if (tableId) {
    customers = customers.filter(c => c.tableId === tableId);
  }
  
  res.json({ success: true, data: customers });
});

app.post('/api/customers', (req, res) => {
  const { name, tableId } = req.body;
  
  if (!name || !tableId) {
    return res.status(400).json({ success: false, error: 'Name and tableId are required' });
  }
  
  const table = db.tables.find(t => t.id === tableId);
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  
  if (table.currentCustomers.length >= table.capacity) {
    return res.status(400).json({ success: false, error: 'Table is at full capacity' });
  }
  
  const newCustomer = {
    id: generateId('cust'),
    name,
    tableId,
    orders: [],
    createdAt: new Date().toISOString(),
  };
  
  db.customers.push(newCustomer);
  table.currentCustomers.push(newCustomer.id);
  table.status = 'occupied';
  
  res.status(201).json({ success: true, data: newCustomer });
});

// Add multiple customers at once
app.post('/api/customers/bulk', (req, res) => {
  const { customers, tableId } = req.body;
  
  if (!customers || !Array.isArray(customers) || !tableId) {
    return res.status(400).json({ success: false, error: 'Customers array and tableId are required' });
  }
  
  const table = db.tables.find(t => t.id === tableId);
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  
  if (table.currentCustomers.length + customers.length > table.capacity) {
    return res.status(400).json({ success: false, error: 'Exceeds table capacity' });
  }
  
  const newCustomers = customers.map(name => ({
    id: generateId('cust'),
    name,
    tableId,
    orders: [],
    createdAt: new Date().toISOString(),
  }));
  
  db.customers.push(...newCustomers);
  table.currentCustomers.push(...newCustomers.map(c => c.id));
  table.status = 'occupied';
  
  res.status(201).json({ success: true, data: newCustomers });
});

app.delete('/api/customers/:id', (req, res) => {
  const customerIndex = db.customers.findIndex(c => c.id === req.params.id);
  
  if (customerIndex === -1) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }
  
  const customer = db.customers[customerIndex];
  const table = db.tables.find(t => t.id === customer.tableId);
  
  // Remove customer's orders
  db.orders = db.orders.filter(o => o.customerId !== customer.id);
  
  // Remove customer from table
  if (table) {
    table.currentCustomers = table.currentCustomers.filter(id => id !== customer.id);
    if (table.currentCustomers.length === 0) {
      table.status = 'free';
    }
  }
  
  db.customers.splice(customerIndex, 1);
  res.json({ success: true, message: 'Customer removed' });
});

// ============ ORDERS ROUTES ============
app.get('/api/orders', (req, res) => {
  const { customerId, tableId, status } = req.query;
  let orders = db.orders;
  
  if (customerId) {
    orders = orders.filter(o => o.customerId === customerId);
  }
  if (tableId) {
    orders = orders.filter(o => o.tableId === tableId);
  }
  if (status) {
    orders = orders.filter(o => o.status === status);
  }
  
  res.json({ success: true, data: orders });
});

app.post('/api/orders', (req, res) => {
  const { customerId, tableId, items } = req.body;
  
  if (!customerId || !tableId) {
    return res.status(400).json({ success: false, error: 'CustomerId and tableId are required' });
  }
  
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }
  
  const orderItems = (items || []).map(item => {
    const product = db.products.find(p => p.id === item.productId);
    return {
      id: generateId('item'),
      productId: item.productId,
      product: product,
      quantity: item.quantity,
      price: product ? product.price * item.quantity : 0,
    };
  });
  
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  
  const newOrder = {
    id: generateId('order'),
    customerId,
    tableId,
    items: orderItems,
    status: 'pending',
    paymentMethod: null,
    paymentStatus: 'unpaid',
    subtotal,
    total: subtotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Add item to order
app.post('/api/orders/:id/items', (req, res) => {
  const { productId, quantity } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  const existingItem = order.items.find(i => i.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = existingItem.quantity * product.price;
  } else {
    order.items.push({
      id: generateId('item'),
      productId,
      product,
      quantity,
      price: quantity * product.price,
    });
  }
  
  order.subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
  order.total = order.subtotal;
  order.updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: order });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: order });
});

// Set payment method
app.put('/api/orders/:id/payment-method', (req, res) => {
  const { method } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  order.paymentMethod = method;
  order.paymentStatus = method ? 'pending' : 'unpaid';
  order.updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: order });
});

// Mark order as paid
app.put('/api/orders/:id/pay', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  order.status = 'paid';
  order.paymentStatus = 'paid';
  order.updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: order });
});

// ============ ADMIN ROUTES ============
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials
  if (email === 'admin@brewmaster.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        user: {
          id: 'admin-1',
          email: 'admin@brewmaster.com',
          name: 'Admin User',
          role: 'admin',
        },
        token: 'demo-jwt-token-' + Date.now(),
      },
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = db.orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  
  const occupiedTables = db.tables.filter(t => t.status === 'occupied').length;
  
  const revenueByCategory = db.products.reduce((acc, product) => {
    const categoryOrders = db.orders.flatMap(o => 
      o.items.filter(i => i.product && i.product.category === product.category)
    );
    const revenue = categoryOrders.reduce((sum, item) => sum + item.price, 0);
    
    if (!acc[product.category]) {
      acc[product.category] = 0;
    }
    acc[product.category] += revenue;
    return acc;
  }, {});
  
  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders: db.orders.length,
      activeCustomers: db.customers.length,
      occupiedTables,
      recentOrders: db.orders.slice(-10).reverse(),
      revenueByCategory: Object.entries(revenueByCategory).map(([category, revenue]) => ({
        category,
        revenue,
      })),
    },
  });
});

// Close table session
app.post('/api/tables/:id/close-session', (req, res) => {
  const table = db.tables.find(t => t.id === req.params.id);
  
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  
  // Remove all customers and their orders from this table
  const customerIds = table.currentCustomers;
  db.orders = db.orders.filter(o => !customerIds.includes(o.customerId));
  db.customers = db.customers.filter(c => c.tableId !== table.id);
  
  table.currentCustomers = [];
  table.status = 'free';
  
  res.json({ success: true, data: table });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/products');
  console.log('  GET  /api/tables');
  console.log('  GET  /api/customers');
  console.log('  GET  /api/orders');
  console.log('  POST /api/admin/login');
  console.log('  GET  /api/admin/stats');
});

module.exports = app;
