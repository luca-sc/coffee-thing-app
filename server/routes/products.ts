import { Router, Request, Response } from 'express';
import { products } from '../data/mock-db';
import { validateIdParam, validateQuery } from '../middleware/validation';

const router = Router();

// GET /api/products - Get all products
router.get(
  '/',
  validateQuery(['category', 'search', 'available']),
  (_req: Request, res: Response) => {
    let filteredProducts = [...products];

    // Filter by category
    if (_req.query.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category === _req.query.category
      );
    }

    // Filter by search term
    if (_req.query.search) {
      const search = String(_req.query.search).toLowerCase();
      filteredProducts = filteredProducts.filter(
        p => p.name.toLowerCase().includes(search) || 
             p.description.toLowerCase().includes(search)
      );
    }

    // Filter by availability
    if (_req.query.available !== undefined) {
      const available = _req.query.available === 'true';
      filteredProducts = filteredProducts.filter(p => p.available === available);
    }

    res.json({
      success: true,
      data: filteredProducts,
    });
  }
);

// GET /api/products/:id - Get single product
router.get(
  '/:id',
  validateIdParam('id'),
  (req: Request, res: Response) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  }
);

// GET /api/products/category/:category - Get products by category
router.get(
  '/category/:category',
  (req: Request, res: Response) => {
    const categoryProducts = products.filter(p => p.category === req.params.category);

    res.json({
      success: true,
      data: categoryProducts,
    });
  }
);

export { router as productsRouter };
