const pool = require('../config/db');

async function getCustomers(req, res, next) {
  try {
    const { tableId } = req.query;
    // prefer to return only active customers (not soft-deleted)
    try {
      let sql = 'SELECT * FROM customers WHERE left_at IS NULL';
      const params = [];
      if (tableId) {
        sql += ' AND table_id = ?';
        params.push(tableId);
      }
      const [rows] = await pool.query(sql, params);
      return res.json({ success: true, data: rows });
    } catch (err) {
      // fallback for existing databases without left_at column
      if (err && err.code === 'ER_BAD_FIELD_ERROR' && /left_at/.test(err.message)) {
        let sql = 'SELECT * FROM customers';
        const params = [];
        if (tableId) {
          sql += ' WHERE table_id = ?';
          params.push(tableId);
        }
        const [rows] = await pool.query(sql, params);
        return res.json({ success: true, data: rows });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { name, tableId } = req.body || {};
    if (!name || !tableId) {
      return res.status(400).json({ success: false, error: 'Missing name or tableId' });
    }
    const [result] = await pool.query(
      'INSERT INTO customers (name, table_id, created_at) VALUES (?, ?, NOW())',
      [name, tableId]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    // mark table occupied
    await pool.query('UPDATE tables_seating SET status = ? WHERE id = ?', ['occupied', tableId]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    // find customer to get table id
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    const tableId = rows[0].table_id;
    // don't allow deleting a customer with unpaid orders
    const [unpaid] = await pool.query(
      "SELECT COUNT(*) as cnt FROM orders WHERE customer_id = ? AND payment_status != 'paid'",
      [id]
    );
    if (unpaid[0].cnt > 0) {
      return res.status(400).json({ success: false, error: 'Customer has unpaid orders' });
    }

    // Soft-delete: mark customer as left so we keep orders in DB
    try {
      await pool.query('UPDATE customers SET left_at = NOW() WHERE id = ?', [id]);
      // if no more active customers at table, mark free
      const [remaining] = await pool.query('SELECT COUNT(*) as cnt FROM customers WHERE table_id = ? AND left_at IS NULL', [tableId]);
      if (remaining[0].cnt === 0) {
        await pool.query('UPDATE tables_seating SET status = ? WHERE id = ?', ['free', tableId]);
      }
      return res.json({ success: true, data: {} });
    } catch (err) {
      // fallback for DB without left_at: keep original behavior (delete)
      if (err && err.code === 'ER_BAD_FIELD_ERROR' && /left_at/.test(err.message)) {
        await pool.query('DELETE FROM customers WHERE id = ?', [id]);
        const [remaining] = await pool.query('SELECT COUNT(*) as cnt FROM customers WHERE table_id = ?', [tableId]);
        if (remaining[0].cnt === 0) {
          await pool.query('UPDATE tables_seating SET status = ? WHERE id = ?', ['free', tableId]);
        }
        return res.json({ success: true, data: {} });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomers, createCustomer, deleteCustomer };
