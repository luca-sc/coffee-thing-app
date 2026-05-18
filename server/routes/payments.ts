import { Router, Request, Response } from 'express';
import { orders } from '../data/mock-db';
import { validateIdParam, validateBody } from '../middleware/validation';
import { PaymentMethod } from '../../types';

const router = Router();

// POST /api/payments/:orderId - Process payment for order
router.post(
  '/:orderId',
  validateIdParam('orderId'),
  validateBody(['method']),
  (req: Request, res: Response) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const validMethods: PaymentMethod[] = ['cash', 'card'];
    if (!validMethods.includes(req.body.method)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method. Must be: cash or card',
      });
    }

    // Set payment method
    orders[orderIndex].paymentMethod = req.body.method;
    orders[orderIndex].paymentStatus = 'pending';
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: orders[orderIndex],
      message: `Payment method set to ${req.body.method}`,
    });
  }
);

// PUT /api/payments/:orderId/confirm - Confirm payment
router.put(
  '/:orderId/confirm',
  validateIdParam('orderId'),
  (req: Request, res: Response) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (!orders[orderIndex].paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method not set',
      });
    }

    // Mark as paid
    orders[orderIndex].paymentStatus = 'paid';
    orders[orderIndex].status = 'paid';
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: orders[orderIndex],
      message: 'Payment confirmed',
    });
  }
);

// GET /api/payments/summary - Get payment summary
router.get('/summary', (_req: Request, res: Response) => {
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  res.json({
    success: true,
    data: {
      totalRevenue,
      pendingRevenue,
      unpaidRevenue,
      paidOrdersCount: paidOrders.length,
      unpaidOrdersCount: unpaidOrders.length,
      pendingOrdersCount: pendingOrders.length,
      paymentBreakdown: {
        cash: paidOrders.filter(o => o.paymentMethod === 'cash').length,
        card: paidOrders.filter(o => o.paymentMethod === 'card').length,
      },
    },
  });
});

export { router as paymentsRouter };
