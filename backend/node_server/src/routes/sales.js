const express = require('express');
const router = express.Router();
const { Sale } = require('../models');

/**
 * GET /sales
 * Returns recent sales newest-first, with embedded line items.
 */
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ created_at: -1 });

    const result = sales.map((sale) => ({
      id: sale._id,
      total_amount: parseFloat(sale.total_amount),
      created_at: sale.created_at,
      items: (sale.items || []).map((item) => ({
        id: item._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        product_name: item.product_name || null,
      })),
    }));

    return res.json(result);
  } catch (err) {
    console.error('[Sales] List error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
