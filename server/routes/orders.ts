import { Router, Request, Response } from 'express';
import { orders, products, generateId } from '../data/mock-db';
import { validateIdParam, validateBody } from '../middleware/validation';
import { OrderStatus } from '../../types';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', (req: Request, res: Response) => {
  let filteredOrders = [...orders];

  // Filter by status
  if (req.query.status) {
    filteredOrders = filteredOrders.filter(o => o.status === req.query.status);
  }

  // Filter by table
  if (req.query.tableId) {
    filteredOrders = filteredOrders.filter(o => o.tableId === req.query.tableId);
  }

  // Filter by customer
  if (req.query.customerId) {
    filteredOrders = filteredOrders.filter(o => o.customerId === req.query.customerId);
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    filteredOrders = filteredOrders.filter(o => o.paymentStatus === req.query.paymentStatus);
  }

  res.json({
    success: true,
    data: filteredOrders,
  });
});

// GET /api/orders/:id - Get single order
router.get(
  '/:id',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  }
);

// POST /api/orders - Create new order
router.post(
  '/',
  validateBody(['customerId', 'tableId']),
  (req: Request, res: Response) => {
    const newOrder = {
      id: generateId('order'),
      customerId: req.body.customerId,
      tableId: req.body.tableId,
      items: [],
      status: 'pending' as OrderStatus,
      paymentMethod: null,
      paymentStatus: 'unpaid' as const,
      subtotal: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
    });
  }
);

// POST /api/orders/:id/items - Add item to order
router.post(
  '/:id/items',
  validateIdParam('id'),
  validateBody(['productId', 'quantity']),
  (req: Request, res: Response) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const product = products.find(p => p.id === req.body.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
      });
    }

    // Check if item already exists in order
    const existingItemIndex = orders[orderIndex].items.findIndex(
      item => item.productId === req.body.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      orders[orderIndex].items[existingItemIndex].quantity += quantity;
      orders[orderIndex].items[existingItemIndex].price = 
        orders[orderIndex].items[existingItemIndex].quantity * product.price;
    } else {
      // Add new item
      const newItem = {
        id: generateId('item'),
        productId: product.id,
        product,
        quantity,
        price: quantity * product.price,
      };
      orders[orderIndex].items.push(newItem);
    }

    // Recalculate totals
    const subtotal = orders[orderIndex].items.reduce((sum, item) => sum + item.price, 0);
    orders[orderIndex].subtotal = subtotal;
    orders[orderIndex].total = subtotal;
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: orders[orderIndex],
    });
  }
);

// DELETE /api/orders/:id/items/:itemId - Remove item from order
router.delete(
  '/:id/items/:itemId',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const itemIndex = orders[orderIndex].items.findIndex(
      item => item.id === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    orders[orderIndex].items.splice(itemIndex, 1);

    // Recalculate totals
    const subtotal = orders[orderIndex].items.reduce((sum, item) => sum + item.price, 0);
    orders[orderIndex].subtotal = subtotal;
    orders[orderIndex].total = subtotal;
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: orders[orderIndex],
    });
  }
);

// PUT /api/orders/:id/status - Update order status
router.put(
  '/:id/status',
  validateIdParam('id'),
  validateBody(['status']),
  (req: Request, res: Response) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const validStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered', 'paid'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    orders[orderIndex].status = req.body.status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: orders[orderIndex],
    });
  }
);

export { router as ordersRouter };
