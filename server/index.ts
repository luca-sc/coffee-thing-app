import express from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products';
import { tablesRouter } from './routes/tables';
import { ordersRouter } from './routes/orders';
import { customersRouter } from './routes/customers';
import { paymentsRouter } from './routes/payments';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
