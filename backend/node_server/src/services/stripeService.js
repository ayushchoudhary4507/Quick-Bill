const Stripe = require('stripe');
const settings = require('../config/settings');

class StripeService {
  /**
   * Helper to get initialized Stripe instance with key validation
   */
  static getStripeClient() {
    const key = settings.stripeSecretKey;
    if (!key || key.includes('YOUR_ACTUAL_SECRET_KEY') || key.trim() === '') {
      throw new Error(
        'Stripe Secret Key is missing or invalid in backend/node_server/.env! Please paste your actual Stripe secret key (starts with sk_test_...) into backend/node_server/.env'
      );
    }
    if (key.startsWith('pk_')) {
      throw new Error(
        'STRIPE_SECRET_KEY in backend/node_server/.env is set to a Publishable Key (pk_test_...). Please update .env with your Secret Key (starts with sk_test_... or sk_live_).'
      );
    }
    return new Stripe(key);
  }

  /**
   * Creates a Stripe Checkout Session for multiple cart items.
   * Returns { url, sessionId, totalAmount }
   */
  static async createCheckoutSession(userId, data) {
    const stripe = StripeService.getStripeClient();

    const lineItems = [];
    let totalAmount = 0;

    for (const item of data.items) {
      lineItems.push({
        price_data: {
          currency: data.currency || 'usd',
          product_data: { name: item.product_name },
          unit_amount: Math.round(item.amount * 100),
        },
        quantity: item.quantity,
      });
      totalAmount += item.amount * item.quantity;
    }

    const cartData = data.items.map((item) => ({ id: item.product_id, qty: item.quantity }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${settings.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${settings.frontendUrl}/payment/cancel`,
      client_reference_id: String(userId),
      metadata: {
        user_id: String(userId),
        cart_items: JSON.stringify(cartData),
      },
    });

    return { url: session.url, sessionId: session.id, totalAmount };
  }

  /**
   * Verifies Stripe webhook signature and returns the event.
   */
  static verifyWebhookSignature(rawBody, sigHeader) {
    if (!settings.stripeWebhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    const stripe = StripeService.getStripeClient();
    return stripe.webhooks.constructEvent(rawBody, sigHeader, settings.stripeWebhookSecret);
  }

  /**
   * Retrieve a Stripe checkout session by ID.
   */
  static async retrieveSession(sessionId) {
    const stripe = StripeService.getStripeClient();
    return stripe.checkout.sessions.retrieve(sessionId);
  }
}

module.exports = { StripeService };
