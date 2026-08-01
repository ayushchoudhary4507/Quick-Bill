const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /products?search=...
 */
router.get('/', async (req, res) => {
  try {
    console.log('DEBUG: Fetching products from MongoDB...');
    const { search } = req.query;

    const filter = search && search.trim()
      ? { name: { $regex: search.trim(), $options: 'i' } }
      : {};

    const products = await Product.find(filter).sort({ name: 1 });
    console.log(`DEBUG: Fetched ${products.length} products`);

    // Format response to match frontend expectations
    const result = products.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image_url: p.image_url,
      created_at: p.created_at,
    }));

    return res.json(result);
  } catch (err) {
    console.error('[Products] List error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

/**
 * POST /products
 * Body: { name, price, stock, image_url }
 */
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, image_url } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ detail: 'name and price are required' });
    }

    // Check duplicate name (case-insensitive)
    const existing = await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ detail: 'A product with this name already exists.' });
    }

    const product = await Product.create({
      name,
      price,
      stock: stock ?? 0,
      image_url: image_url || null,
    });

    return res.status(201).json({
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      created_at: product.created_at,
    });
  } catch (err) {
    console.error('[Products] Create error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

/**
 * PUT /products/:id
 * Body: partial update
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, image_url } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (stock !== undefined) updates.stock = stock;
    if (image_url !== undefined) updates.image_url = image_url;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ detail: 'Product not found' });

    return res.json({
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      created_at: product.created_at,
    });
  } catch (err) {
    console.error('[Products] Update error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

/**
 * DELETE /products/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ detail: 'Product not found' });
    return res.status(204).send();
  } catch (err) {
    console.error('[Products] Delete error:', err);
    return res.status(400).json({ detail: err.message });
  }
});

module.exports = router;
