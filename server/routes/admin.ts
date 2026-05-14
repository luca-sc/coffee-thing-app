import { Router, Request, Response } from 'express';
import { adminUsers, adminCredentials, orders, tables, customers, products } from '../data/mock-db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// POST /api/admin/login - Admin login
router.post(
  '/login',
  validateBody(['email', 'password']),
  (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check credentials
    const storedPassword = adminCredentials[email as keyof typeof adminCredentials];
    if (!storedPassword || storedPassword !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Find admin user
    const user = adminUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${Date.now()}`;

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  }
);

// GET /api/admin/me - Get current admin user
router.get(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => {
    const user = (req as Request & { user?: typeof adminUsers[0] }).user;

    res.json({
      success: true,
      data: user,
    });
  }
);

// GET /api/admin/dashboard - Get dashboard statistics
router.get(
  '/dashboard',
  authMiddleware,
  requireRole('admin', 'manager'),
  (_req: Request, res: Response) => {
    // Calculate statistics
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const freeTables = tables.filter(t => t.status === 'free').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    
    const activeCustomers = customers.length;
    
    // Revenue by category
    const revenueByCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      // Sum up revenue from orders containing this product
      orders.forEach(order => {
        if (order.paymentStatus === 'paid') {
          order.items.forEach(item => {
            if (item.productId === product.id) {
              acc[product.category] += item.price;
            }
          });
        }
      });
      return acc;
    }, {} as Record<string, number>);

    // Recent orders (last 10)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      paid: orders.filter(o => o.status === 'paid').length,
    };

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        activeCustomers,
        tables: {
          total: tables.length,
          occupied: occupiedTables,
          free: freeTables,
          reserved: reservedTables,
        },
        ordersByStatus,
        revenueByCategory: Object.entries(revenueByCategory).map(([category, revenue]) => ({
          category,
          revenue,
        })),
        recentOrders,
      },
    });
  }
);

// GET /api/admin/tables - Get all tables with details
router.get(
  '/tables',
  authMiddleware,
  (_req: Request, res: Response) => {
    const tablesWithDetails = tables.map(table => {
      const tableCustomers = customers.filter(c => c.tableId === table.id);
      const tableOrders = orders.filter(o => o.tableId === table.id);
      
      return {
        ...table,
        customers: tableCustomers.map(customer => ({
          ...customer,
          orders: tableOrders.filter(o => o.customerId === customer.id),
        })),
        totalOrders: tableOrders.length,
        unpaidOrders: tableOrders.filter(o => o.paymentStatus !== 'paid').length,
      };
    });

    res.json({
      success: true,
      data: tablesWithDetails,
    });
  }
);

// GET /api/admin/orders - Get all orders with details
router.get(
  '/orders',
  authMiddleware,
  (req: Request, res: Response) => {
    let filteredOrders = [...orders];

    // Filter by status
    if (req.query.status) {
      filteredOrders = filteredOrders.filter(o => o.status === req.query.status);
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filteredOrders = filteredOrders.filter(o => o.paymentStatus === req.query.paymentStatus);
    }

    // Add customer and table info
    const ordersWithDetails = filteredOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const table = tables.find(t => t.id === order.tableId);
      
      return {
        ...order,
        customerName: customer?.name || 'Unknown',
        tableNumber: table?.number || 0,
      };
    });

    // Sort by creation date (newest first)
    ordersWithDetails.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: ordersWithDetails,
    });
  }
);

export { router as adminRouter };
