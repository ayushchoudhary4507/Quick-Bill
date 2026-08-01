const mongoose = require('mongoose');
const { Product, Sale } = require('../models');

/**
 * Atomic checkout using MongoDB transactions.
 * 1. Consolidate duplicate items
 * 2. Start a Mongoose session + transaction
 * 3. Lock & validate stock using findOneAndUpdate with conditional
 * 4. Create Sale with embedded SaleItems
 * 5. Commit or Rollback
 */
async function processCheckout(items, userId) {
  if (!items || items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  // 1. Consolidate duplicate product_ids
  const merged = {};
  for (const item of items) {
    const pid = item.product_id.toString();
    merged[pid] = (merged[pid] || 0) + item.quantity;
  }
  const productIds = Object.keys(merged);

  // 2. Start Mongoose session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const saleItems = [];

    for (const pid of productIds) {
      const qty = merged[pid];

      // 3. Atomically deduct stock only if sufficient (findOneAndUpdate with condition)
      const product = await Product.findOneAndUpdate(
        {
          _id: pid,
          stock: { $gte: qty }, // only update if enough stock
        },
        { $inc: { stock: -qty } }, // atomically deduct
        { new: true, session }
      );

      if (!product) {
        // Either product not found or insufficient stock
        const notFound = await Product.findById(pid).session(session);
        if (!notFound) {
          const err = new Error(`Product ID ${pid} not found`);
          err.status = 404;
          throw err;
        }
        const err = new Error(
          `Insufficient stock for ${notFound.name}. Available: ${notFound.stock}, Requested: ${qty}`
        );
        err.status = 400;
        throw err;
      }

      console.log(`DEBUG: Product '${product.name}' stock updated to ${product.stock}`);

      const lineTotal = parseFloat(product.price) * qty;
      totalAmount += lineTotal;

      saleItems.push({
        product_id: product._id,
        product_name: product.name,
        quantity: qty,
        price: parseFloat(product.price),
      });
    }

    // 4. Create Sale with embedded items
    const [sale] = await Sale.create(
      [
        {
          total_amount: parseFloat(totalAmount.toFixed(2)),
          created_by: userId,
          created_at: new Date(),
          items: saleItems,
        },
      ],
      { session }
    );

    // 5. Commit
    await session.commitTransaction();
    session.endSession();

    console.log(`SUCCESS: Checkout complete for Sale ${sale._id}`);
    return sale;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { processCheckout };
