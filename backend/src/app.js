/**
 * app.js
 * ---------------------------------------------------------------------
 * Construieste si configureaza aplicatia Express.
 *
 * Este separat de server.js astfel incat testele de integrare (supertest)
 * sa poata importa aplicatia FARA a porni un server care asculta pe port.
 * ---------------------------------------------------------------------
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const tableRoutes = require('./routes/tableRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- CORS: permite frontend-ului (Vite pe 5173) sa apeleze API-ul ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// --- parsarea corpului cererilor in format JSON ---
app.use(express.json());

// --- ruta de verificare a starii serverului ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- montarea rutelor API ---
app.use('/api/auth', authRoutes);          // Task 1: autentificare
app.use('/api/products', productRoutes);   // Task 3: CRUD
app.use('/api/orders', orderRoutes);       // Task 2: logica de business
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', paymentRoutes); // payment subroutes on orders

// --- tratarea erorilor (trebuie inregistrate ultimele) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
