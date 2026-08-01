const Stripe = require('stripe');
const settings = require('../config/settings');

class StripeService {
  /**
   * Creates a Stripe Checkout Session for multiple cart items.
   * - Dynamically uses request origin (e.g. http://localhost:5173) or fallback settings.frontendUrl
   */
  static async createCheckoutSession(userId, data, reqOrigin = null) {
    const key = settings.stripeSecretKey;
    const baseUrl = reqOrigin ? reqOrigin.replace(/\/$/, '') : settings.frontendUrl.replace(/\/$/, '');

    let totalAmount = 0;
    for (const item of data.items) {
      totalAmount += item.amount * item.quantity;
    }

    // Smart Fallback: Mock Test Mode when real Stripe secret key is not set
    if (!key || key.includes('YOUR_ACTUAL_SECRET_KEY') || key.startsWith('pk_') || key.trim() === '') {
      console.log('⚠️ [Stripe] Real Stripe Secret Key not detected in .env. Running in Mock Payment Mode.');
      const mockSessionId = 'cs_test_mock_' + Date.now();
      const mockUrl = `${baseUrl}/payment/success?session_id=${mockSessionId}`;

      return { url: mockUrl, sessionId: mockSessionId, totalAmount };
    }

    // Real Stripe API call
    const stripe = new Stripe(key);
    const lineItems = data.items.map((item) => ({
      price_data: {
        currency: data.currency || 'usd',
        product_data: { name: item.product_name },
        unit_amount: Math.round(item.amount * 100),
      },
      quantity: item.quantity,
    }));

    const cartData = data.items.map((item) => ({ id: item.product_id, qty: item.quantity }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
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
    const key = settings.stripeSecretKey;
    if (!key || key.includes('YOUR_ACTUAL_SECRET_KEY')) {
      throw new Error('Stripe webhook secret not configured');
    }
    const stripe = new Stripe(key);
    return stripe.webhooks.constructEvent(rawBody, sigHeader, settings.stripeWebhookSecret);
  }

  /**
   * Retrieve a Stripe checkout session by ID.
   */
  static async retrieveSession(sessionId) {
    const key = settings.stripeSecretKey;

    // Handle Mock Session verification
    if (sessionId.startsWith('cs_test_mock_')) {
      return {
        payment_status: 'paid',
        payment_intent: 'pi_mock_' + Date.now(),
        customer_details: { email: 'test_customer@example.com' },
        metadata: {},
      };
    }

    if (!key || key.includes('YOUR_ACTUAL_SECRET_KEY')) {
      throw new Error('Stripe key is not configured');
    }

    const stripe = new Stripe(key);
    return stripe.checkout.sessions.retrieve(sessionId);
  }
}

module.exports = { StripeService };
