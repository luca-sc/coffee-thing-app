const pool = require('../config/db');

async function setPaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const { method } = req.body || {};
    if (!method) return res.status(400).json({ success: false, error: 'Missing method' });
    await pool.query('UPDATE orders SET payment_method = ? WHERE id = ?', [method, id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function payOrder(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?', ['paid', 'paid', id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { setPaymentMethod, payOrder };
