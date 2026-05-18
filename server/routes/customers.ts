import { Router, Request, Response } from 'express';
import { customers, tables, orders, generateId } from '../data/mock-db';
import { validateIdParam, validateBody } from '../middleware/validation';

const router = Router();

// GET /api/customers - Get all customers
router.get('/', (req: Request, res: Response) => {
  let filteredCustomers = [...customers];

  // Filter by table
  if (req.query.tableId) {
    filteredCustomers = filteredCustomers.filter(c => c.tableId === req.query.tableId);
  }

  res.json({
    success: true,
    data: filteredCustomers,
  });
});

// GET /api/customers/:id - Get single customer
router.get(
  '/:id',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const customer = customers.find(c => c.id === req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Get customer orders
    const customerOrders = orders.filter(o => o.customerId === customer.id);

    res.json({
      success: true,
      data: {
        ...customer,
        orders: customerOrders,
      },
    });
  }
);

// POST /api/customers - Create new customer
router.post(
  '/',
  validateBody(['name', 'tableId']),
  (req: Request, res: Response) => {
    const table = tables.find(t => t.id === req.body.tableId);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    if (table.currentCustomers.length >= table.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Table is at full capacity',
      });
    }

    const newCustomer = {
      id: generateId('cust'),
      name: req.body.name,
      tableId: req.body.tableId,
      orders: [],
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    
    // Update table
    const tableIndex = tables.findIndex(t => t.id === req.body.tableId);
    tables[tableIndex].currentCustomers.push(newCustomer.id);
    tables[tableIndex].status = 'occupied';

    res.status(201).json({
      success: true,
      data: newCustomer,
    });
  }
);

// DELETE /api/customers/:id - Remove customer
router.delete(
  '/:id',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const customerIndex = customers.findIndex(c => c.id === req.params.id);

    if (customerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    const customer = customers[customerIndex];

    // Remove customer from table
    const tableIndex = tables.findIndex(t => t.id === customer.tableId);
    if (tableIndex >= 0) {
      tables[tableIndex].currentCustomers = tables[tableIndex].currentCustomers.filter(
        id => id !== customer.id
      );
      
      // If no more customers, set table to free
      if (tables[tableIndex].currentCustomers.length === 0) {
        tables[tableIndex].status = 'free';
      }
    }

    // Remove customer orders
    for (let i = orders.length - 1; i >= 0; i--) {
      if (orders[i].customerId === customer.id) {
        orders.splice(i, 1);
      }
    }

    // Remove customer
    customers.splice(customerIndex, 1);

    res.json({
      success: true,
      message: 'Customer removed',
    });
  }
);

// GET /api/customers/:id/orders - Get customer orders
router.get(
  '/:id/orders',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const customer = customers.find(c => c.id === req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    const customerOrders = orders.filter(o => o.customerId === customer.id);

    res.json({
      success: true,
      data: customerOrders,
    });
  }
);

export { router as customersRouter };
