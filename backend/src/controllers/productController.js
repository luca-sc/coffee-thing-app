/**
 * productController.js
 * ---------------------------------------------------------------------
 * Controller pentru OPERATII CRUD pe produse (Task 3 - testare integrare).
 *
 * Acopera: Creare, Citire, Actualizare, Stergere + AUTORIZARE:
 *   "poti edita doar resursele proprii"
 *   -> doar proprietarul (owner_id) sau un 'admin' poate
 *      modifica / sterge un produs.
 *
 * Rutele de citire (GET) sunt publice; cele de scriere necesita JWT.
 * ---------------------------------------------------------------------
 */
const pool = require('../config/db');

const VALID_CATEGORIES = [
  'coffee', 'espresso', 'tea', 'desserts', 'cold-drinks', 'breakfast',
];

/**
 * GET /api/products
 * Listeaza toate produsele. Optional filtrate dupa ?category=
 */
async function getAllProducts(req, res, next) {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY id ASC';

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Returneaza un singur produs dupa id.
 */
async function getProductById(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produsul nu a fost gasit.',
      });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products   (necesita autentificare)
 * Creeaza un produs nou. Proprietarul este utilizatorul autentificat.
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, image } = req.body || {};

    // --- validare campuri obligatorii ---
    if (!name || price === undefined || price === null || !category) {
      return res.status(400).json({
        success: false,
        error: 'Campurile name, price si category sunt obligatorii.',
      });
    }

    // --- validare pret ---
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Pretul trebuie sa fie un numar pozitiv.',
      });
    }

    // --- validare categorie ---
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Categorie invalida. Valori permise: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, category, image, owner_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        numericPrice,
        category,
        image || '/images/products/default.jpg',
        req.user.id, // proprietarul = utilizatorul autentificat
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id   (necesita autentificare + autorizare proprietar)
 * Actualizeaza un produs existent.
 */
async function updateProduct(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produsul nu a fost gasit.',
      });
    }

    const product = rows[0];

    // --- AUTORIZARE: doar proprietarul sau un admin poate edita ---
    if (product.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Nu aveti permisiunea de a edita acest produs.',
      });
    }

    // se actualizeaza doar campurile trimise (restul raman neschimbate)
    const name = req.body.name ?? product.name;
    const description = req.body.description ?? product.description;
    const category = req.body.category ?? product.category;
    const image = req.body.image ?? product.image;
    const available = req.body.available ?? product.available;
    let price = product.price;

    if (req.body.price !== undefined) {
      const numericPrice = Number(req.body.price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          error: 'Pretul trebuie sa fie un numar pozitiv.',
        });
      }
      price = numericPrice;
    }

    if (req.body.category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Categorie invalida. Valori permise: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    await pool.query(
      `UPDATE products
         SET name = ?, description = ?, price = ?, category = ?, image = ?, available = ?
       WHERE id = ?`,
      [name, description, price, category, image, available, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id   (necesita autentificare + autorizare proprietar)
 * Sterge un produs existent.
 */
async function deleteProduct(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produsul nu a fost gasit.',
      });
    }

    const product = rows[0];

    // --- AUTORIZARE: doar proprietarul sau un admin poate sterge ---
    if (product.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Nu aveti permisiunea de a sterge acest produs.',
      });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Produs sters cu succes.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  VALID_CATEGORIES,
};
