const { Sale } = require('../models');

/**
 * Returns top N best-selling products by total quantity sold.
 * Uses MongoDB aggregation pipeline.
 */
async function getTopProducts(limit = 5) {
  const results = await Sale.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product_name',
        total_sold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { total_sold: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        product_name: '$_id',
        total_sold: 1,
      },
    },
  ]);

  return results;
}

/**
 * Returns products with stock <= 5 (low-stock alerts)
 */
async function getLowStockProducts() {
  const { Product } = require('../models');
  return Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 });
}

module.exports = { getTopProducts, getLowStockProducts };
