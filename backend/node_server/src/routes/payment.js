const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { Payment, Product, Sale } = require('../models');
const { StripeService } = require('../services/stripeService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /payments/create-checkout-session
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user._id;

    // Pre-checkout stock verification
    for (const item of data.items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ detail: `Product ${item.product_name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          detail: `Insufficient stock for ${item.product_name}. Available: ${product.stock}`,
        });
      }
    }

    const { url, sessionId, totalAmount } = await StripeService.createCheckoutSession(userId.toString(), data);

    await Payment.create({
      user_id: userId,
      stripe_checkout_session_id: sessionId,
      amount: totalAmount,
      currency: data.currency || 'usd',
      status: 'pending',
    });

    return res.json({ checkout_url: url });
  } catch (err) {
    console.error('[Payments] create-checkout-session error:', err);
    return res.status(400).json({ detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /payments/webhook  (Stripe raw body)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('DEBUG: Webhook received!');
  const sigHeader = req.headers['stripe-signature'];

  let event;
  try {
    event = StripeService.verifyWebhookSignature(req.body, sigHeader);
  } catch (err) {
    console.error('Webhook Signature Error:', err.message);
    return res.status(400).json({ detail: err.message });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const stripeSessionId = session.id;

    const payment = await Payment.findOne({ stripe_checkout_session_id: stripeSessionId });
    if (payment && payment.status !== 'confirmed') {
      try {
        const metadata = session.metadata || {};
        const cartItemsStr = metadata.cart_items;

        if (cartItemsStr) {
          const cartItems = JSON.parse(cartItemsStr);
          const userId = metadata.user_id;
          const saleItems = [];

          for (const item of cartItems) {
            const product = await Product.findByIdAndUpdate(
              item.id,
              { $inc: { stock: -item.qty } },
              { new: true }
            );
            if (product) {
              saleItems.push({
                product_id: product._id,
                product_name: product.name,
                quantity: item.qty,
                price: product.price,
              });
            }
          }

          await Sale.create({
            total_amount: payment.amount,
            created_by: userId,
            items: saleItems,
          });
        }

        payment.status = 'confirmed';
        payment.stripe_payment_id = session.payment_intent;
        payment.customer_email = session.customer_details?.email;
        payment.updated_at = new Date();
        await payment.save();

        console.log(`SUCCESS: Payment confirmed for session ${stripeSessionId}`);
      } catch (err) {
        console.error('Webhook transaction failed:', err);
      }
    }
  }

  return res.json({ status: 'success' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/verify-session/:sessionId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await StripeService.retrieveSession(sessionId);

    if (session.payment_status === 'paid') {
      const payment = await Payment.findOne({ stripe_checkout_session_id: sessionId });

      if (payment && payment.status !== 'confirmed') {
        const metadata = session.metadata || {};
        const cartItemsStr = metadata.cart_items;
        if (cartItemsStr) {
          const cartItems = JSON.parse(cartItemsStr);
          const userId = metadata.user_id;
          const saleItems = [];

          for (const item of cartItems) {
            const product = await Product.findByIdAndUpdate(
              item.id,
              { $inc: { stock: -item.qty } },
              { new: true }
            );
            if (product) {
              saleItems.push({
                product_id: product._id,
                product_name: product.name,
                quantity: item.qty,
                price: product.price,
              });
            }
          }

          await Sale.create({
            total_amount: payment.amount,
            created_by: userId,
            items: saleItems,
          });
        }

        payment.status = 'confirmed';
        payment.stripe_payment_id = session.payment_intent;
        payment.customer_email = session.customer_details?.email;
        payment.updated_at = new Date();
        await payment.save();

        return res.json({ status: 'confirmed', message: 'Payment verified successfully' });
      }

      return res.json({ status: payment ? payment.status : 'not_found' });
    }

    return res.json({ status: session.payment_status });
  } catch (err) {
    console.error('[Payments] verify-session error:', err);
    return res.status(400).json({ detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/history  (user's own payments)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user._id }).sort({ created_at: -1 });

    // Auto-verify pending payments
    for (const p of payments) {
      if (p.status === 'pending') {
        try {
          const session = await StripeService.retrieveSession(p.stripe_checkout_session_id);
          if (session.payment_status === 'paid') {
            p.status = 'confirmed';
            p.stripe_payment_id = session.payment_intent;
            p.customer_email = session.customer_details?.email;
            p.updated_at = new Date();
            await p.save();
          }
        } catch { /* ignore */ }
      }
    }

    return res.json({ payments, total_count: payments.length });
  } catch (err) {
    console.error('[Payments] history error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/admin/all
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    return res.json({ payments, total_count: payments.length });
  } catch (err) {
    console.error('[Payments] admin/all error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
