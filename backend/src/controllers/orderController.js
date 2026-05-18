/**
 * orderController.js
 * ---------------------------------------------------------------------
 * Controller pentru COMENZI. Leaga logica de business (orderService.js)
 * de baza de date MySQL.
 *
 * La crearea unei comenzi:
 *   1. valideaza datele primite
 *   2. citeste preturile reale ale produselor din baza de date
 *   3. apeleaza calculateOrderTotal() -> subtotal, discount, tax, total
 *   4. salveaza comanda si liniile ei intr-o TRANZACTIE (atomicitate)
 * ---------------------------------------------------------------------
 */
const pool = require('../config/db');
const orderService = require('../services/orderService');

/**
 * GET /api/orders   (necesita autentificare)
 * Listeaza comenzile, optional filtrate dupa ?status= sau ?customerId=
 */
async function getAllOrders(req, res, next) {
  try {
    const { status, customerId } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (customerId) {
      conditions.push('customer_id = ?');
      params.push(customerId);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const [orders] = await pool.query(sql, params);
    return res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id   (necesita autentificare)
 * Returneaza o comanda impreuna cu liniile ei.
 */
async function getOrderById(req, res, next) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comanda nu a fost gasita.',
      });
    }
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    return res.json({
      success: true,
      data: { ...orders[0], items },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders   (necesita autentificare)
 * Creeaza o comanda noua. Body asteptat:
 *   { customerId, tableId, items: [{ productId, quantity }, ...] }
 */
async function createOrder(req, res, next) {
  // se ia o conexiune dedicata pentru tranzactie
  const connection = await pool.getConnection();
  try {
    const { customerId, tableId, items } = req.body || {};

    // --- validare campuri obligatorii ---
    if (!customerId || !tableId) {
      return res.status(400).json({
        success: false,
        error: 'Campurile customerId si tableId sunt obligatorii.',
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comanda trebuie sa contina cel putin un produs.',
      });
    }

    // --- verificare existenta client ---
    const [customers] = await connection.query(
      'SELECT id FROM customers WHERE id = ?',
      [customerId]
    );
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Clientul nu a fost gasit.',
      });
    }

    // --- citirea preturilor reale ale produselor din baza de date ---
    // (nu avem incredere in preturile trimise de client)
    const productIds = items.map((i) => i.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const [products] = await connection.query(
      `SELECT id, price FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    // construim liniile pentru calculul de business
    const serviceItems = [];
    for (const item of items) {
      const unitPrice = priceMap.get(item.productId);
      if (unitPrice === undefined) {
        return res.status(404).json({
          success: false,
          error: `Produsul cu id ${item.productId} nu exista.`,
        });
      }
      serviceItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    // --- LOGICA DE BUSINESS: calculul notei de plata ---
    // orderService valideaza cantitatile si arunca eroare daca sunt invalide
    let totals;
    try {
      totals = orderService.calculateOrderTotal(serviceItems);
    } catch (businessErr) {
      return res.status(400).json({
        success: false,
        error: businessErr.message,
      });
    }

    // --- salvarea in TRANZACTIE (totul sau nimic) ---
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders
         (customer_id, table_id, subtotal, discount, tax, total, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId, tableId,
        totals.subtotal, totals.discount, totals.tax, totals.total,
        req.user.id,
      ]
    );
    const orderId = orderResult.insertId;

    for (const item of serviceItems) {
      const lineTotal = orderService.roundMoney(item.quantity * item.unitPrice);
      await connection.query(
        `INSERT INTO order_items
           (order_id, product_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.unitPrice, lineTotal]
      );
    }

    await connection.commit();

    const [createdItems] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: orderId,
        customerId,
        tableId,
        status: 'pending',
        paymentStatus: 'unpaid',
        ...totals,
        items: createdItems,
      },
    });
  } catch (err) {
    // daca ceva esueaza, anulam toate modificarile
    await connection.rollback();
    next(err);
  } finally {
    // eliberam conexiunea inapoi in pool
    connection.release();
  }
}

/**
 * PUT /api/orders/:id/status   (necesita autentificare)
 * Schimba starea unei comenzi, respectand fluxul permis de tranzitii.
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'paid'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Stare invalida. Valori permise: ${validStatuses.join(', ')}.`,
      });
    }

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comanda nu a fost gasita.',
      });
    }

    const currentStatus = orders[0].status;

    // --- verificare tranzitie permisa (logica de business) ---
    if (!orderService.canTransitionStatus(currentStatus, status)) {
      return res.status(400).json({
        success: false,
        error: `Tranzitia de la "${currentStatus}" la "${status}" nu este permisa.`,
      });
    }

    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
