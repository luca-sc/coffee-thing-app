import { Router, Request, Response } from 'express';
import { tables, customers, generateId } from '../data/mock-db';
import { validateIdParam, validateBody } from '../middleware/validation';
import { TableStatus } from '../../types';

const router = Router();

// GET /api/tables - Get all tables
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: tables,
  });
});

// GET /api/tables/:id - Get single table
router.get(
  '/:id',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const table = tables.find(t => t.id === req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    // Get customers for this table
    const tableCustomers = customers.filter(c => c.tableId === table.id);

    res.json({
      success: true,
      data: {
        ...table,
        customers: tableCustomers,
      },
    });
  }
);

// PUT /api/tables/:id/status - Update table status
router.put(
  '/:id/status',
  validateIdParam('id'),
  validateBody(['status']),
  (req: Request, res: Response) => {
    const tableIndex = tables.findIndex(t => t.id === req.params.id);

    if (tableIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    const validStatuses: TableStatus[] = ['free', 'occupied', 'reserved'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: free, occupied, or reserved',
      });
    }

    tables[tableIndex].status = req.body.status;

    // If status is 'free', clear customers
    if (req.body.status === 'free') {
      tables[tableIndex].currentCustomers = [];
    }

    res.json({
      success: true,
      data: tables[tableIndex],
    });
  }
);

// POST /api/tables/:id/customers - Add customer to table
router.post(
  '/:id/customers',
  validateIdParam('id'),
  validateBody(['name']),
  (req: Request, res: Response) => {
    const table = tables.find(t => t.id === req.params.id);

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
      tableId: table.id,
      orders: [],
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    table.currentCustomers.push(newCustomer.id);
    table.status = 'occupied';

    res.status(201).json({
      success: true,
      data: newCustomer,
    });
  }
);

// DELETE /api/tables/:id/session - Close table session
router.delete(
  '/:id/session',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const tableIndex = tables.findIndex(t => t.id === req.params.id);

    if (tableIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    // Remove all customers from this table
    const tableCustomerIds = tables[tableIndex].currentCustomers;
    for (let i = customers.length - 1; i >= 0; i--) {
      if (tableCustomerIds.includes(customers[i].id)) {
        customers.splice(i, 1);
      }
    }

    // Reset table
    tables[tableIndex].currentCustomers = [];
    tables[tableIndex].status = 'free';

    res.json({
      success: true,
      message: 'Table session closed',
      data: tables[tableIndex],
    });
  }
);

export { router as tablesRouter };
