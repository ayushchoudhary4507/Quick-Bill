const express = require('express');
const router = express.Router();
const { getTopProducts, getLowStockProducts } = require('../services/analyticsService');

/**
 * GET /analytics/top-products
 * Returns top 5 best-selling products
 */
router.get('/top-products', async (req, res) => {
  try {
    const data = await getTopProducts(5);
    return res.json(data);
  } catch (err) {
    console.error('[Analytics] top-products error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

/**
 * GET /analytics/low-stock
 * Returns products with stock <= 5
 */
router.get('/low-stock', async (req, res) => {
  try {
    const products = await getLowStockProducts();
    return res.json(products);
  } catch (err) {
    console.error('[Analytics] low-stock error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
