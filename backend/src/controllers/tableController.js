const pool = require('../config/db');

async function getAllTables(_req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM tables_seating ORDER BY number');
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function updateTableStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ success: false, error: 'Missing status' });
    }
    await pool.query('UPDATE tables_seating SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await pool.query('SELECT * FROM tables_seating WHERE id = ?', [id]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTables, updateTableStatus };
