const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { processCheckout } = require('../services/checkoutService');

/**
 * POST /checkout
 * Body: { items: [{ product_id, quantity }] }
 * Requires: Bearer token
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ detail: 'Cart is empty' });
    }

    const sale = await processCheckout(items, req.user._id);

    return res.json({
      message: 'Checkout successful',
      total: parseFloat(sale.total_amount),
      sale_id: sale._id,
      total_amount: parseFloat(sale.total_amount),
      success: true,
    });
  } catch (err) {
    console.error('[Checkout] Error:', err);
    const status = err.status || 500;
    return res.status(status).json({ detail: err.message || 'Checkout failed' });
  }
});

module.exports = router;
