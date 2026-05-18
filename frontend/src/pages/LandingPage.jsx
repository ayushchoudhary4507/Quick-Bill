import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  
  // Interactive Simulator State
  const [cart, setCart] = useState([]);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [activeFaq, setActiveFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const demoProducts = [
    { id: 1, name: 'Artisan Cold Brew', price: 4.50, category: 'Beverage', icon: '☕' },
    { id: 2, name: 'Avocado Sourdough', price: 8.50, category: 'Food', icon: '🥑' },
    { id: 3, name: 'Glazed Blueberry Muffin', price: 3.25, category: 'Bakery', icon: '🧁' },
    { id: 4, name: 'Matcha Croissant', price: 4.00, category: 'Bakery', icon: '🥐' },
  ];

  const addToCart = (product) => {
    if (checkoutStep === 'success') {
      // Reset if previous sale was successful
      setCart([{ ...product, qty: 1 }]);
      setCheckoutStep('idle');
      setDiscountApplied(false);
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    toast.success(`${product.name} added to demo cart!`, { id: `add-${product.id}` });
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;
    if (existing.qty === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item));
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscountApplied(false);
    setCheckoutStep('idle');
    toast.success('Demo cart cleared.');
  };

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME20') {
      setDiscountApplied(true);
      toast.success('20% Discount Promo Code applied successfully!');
    } else {
      toast.error('Invalid promo code. Try "WELCOME20"');
    }
  };

  const handleSimulatePayment = () => {
    if (cart.length === 0) {
      toast.error('Add items to the cart first!');
      return;
    }
    setCheckoutStep('processing');
    setTimeout(() => {
      setCheckoutStep('success');
      toast.success('Stripe Payment Simulated Successfully!');
    }, 2000);
  };

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    toast.success('Thank you for subscribing to Quick-Bill insights!');
  };

  // Pricing calculations
  const prices = {
    starter: billingCycle === 'monthly' ? 0 : 0,
    pro: billingCycle === 'monthly' ? 29 : 23,
    enterprise: billingCycle === 'monthly' ? 99 : 79
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = discountApplied ? subtotal * 0.20 : 0;
  const tax = (subtotal - discount) * 0.10;
  const total = subtotal - discount + tax;

  const faqs = [
    {
      q: 'Do I need special hardware to run Quick-Bill?',
      a: 'Absolutely not! Quick-Bill is fully responsive and runs on any modern browser. You can use it on iPads, Android tablets, iPhones, laptops, or standard desktop computers. It also supports standard barcode scanners and USB receipt printers.'
    },
    {
      q: 'How does the Stripe Payment integration work?',
      a: 'Quick-Bill integrates seamlessly with Stripe Checkout. When cashiers finalize an invoice, they can select Card payment, which generates a Stripe checkout link. Once the customer pays, Stripe triggers a webhook that updates the sales record and syncs inventory automatically.'
    },
    {
      q: 'Is there a limit to how many products or cashiers I can add?',
      a: 'Our Starter plan supports up to 50 products and 2 cashiers. Our Pro and Enterprise plans allow unlimited products, unlimited transactions, and unlimited cashiers across multiple registers.'
    },
    {
      q: 'Can I export my sales and inventory reports?',
      a: 'Yes, absolutely. From the Admin Dashboard, you can filter sales by date, cashier, or payment method, and export complete reports in PDF or CSV formats. You also get a real-time visual chart of your sales trends.'
    },
    {
      q: 'How does real-time stock sync work?',
      a: 'Every time a product is sold through the POS or custom Stripe payments, the database automatically decrements the stock counts. If an item drops below the custom warning threshold, a real-time warning badge appears on the POS checkout page to alert cashiers.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-slate-900 overflow-x-hidden font-sans">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* GUEST & LANDING NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-lg font-bold text-slate-900 shadow-lg shadow-emerald-500/20">
              QB
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Quick-Bill
              </span>
              <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Modern Retail POS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              Live Demo <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase animate-pulse">Try</span>
            </a>
            <a href="#analytics" className="hover:text-emerald-400 transition-colors">Analytics</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/products'}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
              >
                Go to Terminal
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-8 animate-fadeIn">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Introducing v2.5: Stripe Payments & Real-time Sync</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Lightning Fast Billing.
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Seamless Inventory & Payments.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed mb-12">
            The ultimate web-based POS system tailored for retail stores, boutique shops, and restaurants. 
            Manage inventory with real-time stock sync, accept instant credit cards via Stripe, and analyze growth with rich visual reports.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-xl shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
              Get Started for Free
            </Link>
            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:text-white transform hover:-translate-y-0.5"
            >
              Play with Live Simulator
            </a>
          </div>

          {/* Premium UI Mockup Presentation */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-700 bg-slate-950/80 p-3 sm:p-4 shadow-2xl shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-2xl pointer-events-none" />
            <div className="flex items-center gap-1.5 px-3 pb-3 border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-500 ml-4 select-none font-mono">quickbill.com/terminal/products</span>
            </div>
            
            {/* Simulation of App Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 text-left font-sans text-xs">
              
              {/* Product catalog preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-slate-800 rounded-md animate-pulse" />
                  <div className="h-6 w-24 bg-slate-800 rounded-md animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { n: 'Double Espresso', p: '$3.50', stock: '24 left', c: 'border-slate-800 bg-slate-900/60' },
                    { n: 'Butter Croissant', p: '$3.00', stock: '2 left', c: 'border-amber-500/40 bg-slate-900/60', low: true },
                    { n: 'Avocado Salad', p: '$9.25', stock: '12 left', c: 'border-slate-800 bg-slate-900/60' },
                    { n: 'Flat White', p: '$4.25', stock: '40 left', c: 'border-slate-800 bg-slate-900/60' },
                    { n: 'Iced Matcha Tea', p: '$4.75', stock: '0 left', c: 'border-slate-800 bg-slate-900/30 opacity-65', out: true },
                    { n: 'Chocolate Brownie', p: '$3.80', stock: '18 left', c: 'border-slate-800 bg-slate-900/60' },
                  ].map((p, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${p.c} flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden`}>
                      <div>
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>{p.n}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">{p.p}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${p.out ? 'bg-rose-500/20 text-rose-400' : p.low ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          {p.stock}
                        </span>
                        {!p.out && <span className="h-5 w-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">+</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart sidebar preview */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-3 flex flex-col justify-between h-full min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-semibold text-slate-200">Active Bill</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">REGISTER #1</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>1 × Double Espresso</span>
                      <span className="font-mono">$3.50</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>2 × Butter Croissant</span>
                      <span className="font-mono text-amber-400">$6.00</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/50 pt-2">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-mono">$9.50</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Tax (10%)</span>
                      <span className="font-mono">$0.95</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3 font-semibold text-sm text-slate-100">
                    <span>Total Due</span>
                    <span className="font-mono text-emerald-400">$10.45</span>
                  </div>
                  <button className="w-full bg-emerald-600/90 text-white rounded-lg py-2 font-bold shadow-md hover:bg-emerald-600 transition-colors text-xs flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Simulate Stripe Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="bg-slate-950 border-y border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">$12M+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold uppercase tracking-wider">Transaction Volume</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono">10k+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold uppercase tracking-wider">Active Terminals</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">99.99%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold uppercase tracking-wider">Gateway Uptime</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">&lt; 1.2s</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold uppercase tracking-wider">Average Checkout Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE BILLING SIMULATOR */}
      <section id="simulator" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              Quick-Bill Play
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Don't take our word for it. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Try the live checkout experience!
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Add delicious mock menu items to the invoice below, apply our special promotional coupon, and simulate a secure checkout. Try typing <b>WELCOME20</b> into the coupon field!
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              
              {/* Product Catalog Grid */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                    Interactive POS Catalog
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-medium">
                    Store ID: #9402
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demoProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all duration-300 text-left flex items-center justify-between shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-800 rounded-xl group-hover:bg-slate-750 transition-colors">{p.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-100">${p.price.toFixed(2)}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold inline-block mt-1">
                          In Stock
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-4">
                  <p className="text-xs text-slate-400 font-semibold mb-3">🏷️ APPLY DEMO PROMO CODE</p>
                  <form onSubmit={applyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. WELCOME20"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 flex-1 font-mono uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 transition-colors text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
                    >
                      Apply
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Tip: Enter <b className="text-emerald-400 font-mono">WELCOME20</b> and click Apply to enjoy an instant 20% discount on the demo cart!
                  </p>
                </div>
              </div>

              {/* Digital Register Terminal Panel */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="border border-slate-800 bg-slate-900/60 rounded-3xl p-5 flex flex-col justify-between h-full min-h-[440px] relative overflow-hidden">
                  
                  {checkoutStep === 'processing' && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mb-4" />
                      <h4 className="font-bold text-slate-100 mb-2">Simulating Stripe Gateway...</h4>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Connecting to Stripe secure checkout. Validating inventory ledger balances and processing 3D Secure verification...
                      </p>
                    </div>
                  )}

                  {checkoutStep === 'success' && (
                    <div className="absolute inset-0 bg-slate-950 z-30 flex flex-col justify-between p-5 text-center">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-emerald-500/10 animate-bounce">
                          ✓
                        </div>
                        <h4 className="font-extrabold text-lg text-white mb-1">Payment Successful!</h4>
                        <p className="text-xs text-slate-400 mb-6">Stripe Receipt #txn_840924823</p>
                        
                        {/* Printable Receipt Preview */}
                        <div className="w-full max-w-[280px] bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left font-mono text-[10px] text-slate-300">
                          <p className="text-center font-bold text-slate-100 text-xs tracking-widest border-b border-dashed border-slate-800 pb-2 mb-2">QUICK-BILL RECEIPT</p>
                          <p className="flex justify-between"><span>Date:</span> <span>{new Date().toLocaleDateString()}</span></p>
                          <p className="flex justify-between"><span>Time:</span> <span>{new Date().toLocaleTimeString()}</span></p>
                          <p className="flex justify-between"><span>Register:</span> <span>Terminal #1</span></p>
                          <p className="border-b border-dashed border-slate-800 my-2" />
                          <div className="space-y-1">
                            {cart.map(item => (
                              <p key={item.id} className="flex justify-between">
                                <span>{item.qty}x {item.name.substring(0, 15)}</span>
                                <span>${(item.price * item.qty).toFixed(2)}</span>
                              </p>
                            ))}
                          </div>
                          <p className="border-b border-dashed border-slate-800 my-2" />
                          {discountApplied && (
                            <p className="flex justify-between text-emerald-400 font-bold">
                              <span>Promo 20%:</span> <span>-${discount.toFixed(2)}</span>
                            </p>
                          )}
                          <p className="flex justify-between text-slate-400"><span>Tax (10%):</span> <span>${tax.toFixed(2)}</span></p>
                          <p className="flex justify-between text-white font-extrabold text-sm border-t border-dashed border-slate-800 pt-2 mt-2">
                            <span>TOTAL PAID:</span> <span>${total.toFixed(2)}</span>
                          </p>
                          <p className="text-center text-[8px] text-slate-500 mt-4 italic">Thank you for visiting! Verified via Stripe</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-900">
                        <button
                          onClick={() => {
                            clearCart();
                            toast.success('Simulation reset. Create a new bill!');
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl py-2.5 font-bold transition-all text-xs"
                        >
                          New Checkout
                        </button>
                        <button
                          onClick={() => {
                            toast.success('Demonstration: In-app receipts can be printed automatically or sent via email.');
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 rounded-xl py-2.5 font-bold transition-all text-xs"
                        >
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Normal Terminal View */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                        <div>
                          <h4 className="font-bold text-slate-200">Terminal Cart</h4>
                          <p className="text-[10px] text-slate-500">Add products on the left</p>
                        </div>
                        <button
                          onClick={clearCart}
                          className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>

                      {cart.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 px-4">
                          <span className="text-3xl mb-2">🛒</span>
                          <p className="font-medium text-slate-400 text-xs">Your terminal cart is empty</p>
                          <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                            Click any item from the catalog to build an invoice and test the calculations.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 transition-all duration-200">
                              <div>
                                <p className="font-semibold text-slate-200 text-xs">{item.name}</p>
                                <p className="text-[9px] text-slate-500">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center font-bold text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-xs font-bold text-slate-100 min-w-[16px] text-center">{item.qty}</span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center font-bold text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-200 min-w-[50px] text-right">
                                  ${(item.price * item.qty).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-850">
                      <div className="space-y-2 mb-4 font-mono text-[11px] text-slate-400">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="text-slate-300 font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        {discountApplied && (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>Promo Code (20% Off)</span>
                            <span>-${discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Sales Tax (10%)</span>
                          <span className="text-slate-300">${tax.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-4 font-bold text-sm text-slate-100 border-t border-slate-850 pt-3">
                        <span>Total Due</span>
                        <span className="font-mono text-emerald-400 text-lg">${total.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={handleSimulatePayment}
                        disabled={cart.length === 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-extrabold rounded-2xl py-3.5 shadow-lg shadow-emerald-500/10 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                        Simulate Stripe Payment
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-y border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              Complete POS Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Everything you need to run your store, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                built in one unified solution
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Forget clunky terminals. Quick-Bill provides lightning speed checkout, beautiful automated reports, role permissions, and integrated credit cards, operating on any hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                t: 'Instant POS Terminal',
                d: 'Load, search, filter, and add items to a dynamic bill in milliseconds. Seamless support for multiple registers in a single shop.',
                icon: (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                t: 'Stripe Payments',
                d: 'Accept Visa, Mastercard, AMEX, and Google Pay with a robust Stripe checkout link. Success redirects ensure stock is updated instantly.',
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                t: 'Smart Inventory Ledger',
                d: 'Automatic decrement on POS purchase or custom Stripe ledger checks. Set custom low-stock thresholds to prompt cashiers prior to shortages.',
                icon: (
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )
              },
              {
                t: 'Sales & Revenue Analytics',
                d: 'Dive deep into your metrics. Visual revenue charts, custom date-range queries, popular item listings, and printable sales reports.',
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                t: 'Role-Based Access (RBAC)',
                d: 'Distinguish between secure Admin functions and regular cashiers. Admins gain exclusive access to stock adjustment, pricing edits, and revenue ledgers.',
                icon: (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              {
                t: 'Cloud Synced Database',
                d: 'Powered by PostgreSQL backend, ensuring that any registers in the store are immediately synchronized to prevent double selling or data lag.',
                icon: (
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
                  </svg>
                )
              }
            ].map((f, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="h-12 w-12 rounded-2xl bg-slate-850 flex items-center justify-center mb-6 shadow-md border border-slate-850">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-lg text-slate-100 mb-3">{f.t}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RICH VISUAL ANALYTICS DEMONSTRATION */}
      <section id="analytics" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                Admin Analytics
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
                Visualize growth and sales trends in real-time
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Take the guesswork out of store management. Quick-Bill maps hourly sales, peak revenue trends, best-selling product categories, and individual cashier performance instantly.
              </p>
              <div className="space-y-4">
                {[
                  'Automatic charting of weekly and monthly revenue curves.',
                  'Popular product breakdowns to manage stock priorities.',
                  'Exportable CSV and PDF spreadsheets for accounting ledgers.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="h-5 w-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                    <span className="text-slate-350 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group text-sm"
                >
                  Explore Dashboard Analytics
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px]" />
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Revenue Analytics</h3>
                  <p className="text-[10px] text-slate-500">Live shop tracking chart</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-350">7 Days</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">30 Days</span>
                </div>
              </div>

              {/* Analytics Metric Cards Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Revenue</p>
                  <p className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">$42,890.50</p>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded font-semibold">+18.4%</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Sales Count</p>
                  <p className="text-base sm:text-lg font-bold font-mono text-slate-200 mt-1">1,248 txn</p>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded font-semibold">+12.1%</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg Ticket</p>
                  <p className="text-base sm:text-lg font-bold font-mono text-slate-200 mt-1">$34.36</p>
                  <span className="text-[9px] text-rose-400 bg-rose-500/5 px-1.5 py-0.5 rounded font-semibold">-2.4%</span>
                </div>
              </div>

              {/* Animated Custom Chart SVG */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.75" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.75" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.75" />
                  
                  {/* Area beneath chart path */}
                  <path
                    d="M0,150 L0,120 Q50,90 100,105 T200,60 T300,75 T400,35 T500,45 L500,150 Z"
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Glowing Chart Path */}
                  <path
                    d="M0,120 Q50,90 100,105 T200,60 T300,75 T400,35 T500,45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Intersect Dots */}
                  <circle cx="200" cy="60" r="5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                  <circle cx="400" cy="35" r="5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                </svg>

                {/* Floating Chart Details Tooltip */}
                <div className="absolute top-6 left-[36%] bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-center font-mono text-[9px] shadow-lg">
                  <span className="text-slate-500 block">MAY 15 Peak</span>
                  <span className="text-emerald-400 font-bold">$2,840.00</span>
                </div>
              </div>

              {/* Chart X-axis Labels */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3 px-1">
                <span>MAY 01</span>
                <span>MAY 08</span>
                <span>MAY 15</span>
                <span>MAY 22</span>
                <span>MAY 29</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-y border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              Simple Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Choose the perfect plan for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                your growing business
              </span>
            </h2>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 p-1 rounded-xl mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Yearly Billing
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-400 text-sm tracking-wider uppercase mb-2">Starter</p>
                <p className="text-slate-500 text-xs mb-6">Ideal for small street vendors or home-based retail startups.</p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl font-extrabold font-mono text-slate-100">${prices.starter}</span>
                  <span className="text-slate-500 text-xs font-semibold">/month</span>
                </div>
                <div className="border-t border-slate-800/80 my-6" />
                <ul className="space-y-4 text-xs text-slate-400">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>1 Active Register Terminal</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Up to 50 Products Catalog</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>100 Monthly POS Sales</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 line-through">
                    <span>×</span>
                    <span>Stripe payment integrations</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 line-through">
                    <span>×</span>
                    <span>Admin Revenue Charts</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-750 transition-colors border border-slate-700 hover:border-slate-600"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/5 relative flex flex-col justify-between transform lg:-translate-y-2">
              <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-md">
                Most Popular
              </span>
              <div>
                <p className="font-bold text-emerald-400 text-sm tracking-wider uppercase mb-2">Professional</p>
                <p className="text-slate-400 text-xs mb-6">Perfect for brick-and-mortar retail stores and busy coffee shops.</p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl font-extrabold font-mono text-white">${prices.pro}</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
                <div className="border-t border-slate-800 my-6" />
                <ul className="space-y-4 text-xs text-slate-350">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="text-slate-200">Unlimited Active Registers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="text-slate-200">Unlimited Products Catalog</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="text-slate-200">Unlimited Monthly POS Sales</span>
                  </li>
                  <li className="flex items-center gap-3 flex-wrap">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="text-emerald-400 font-semibold">Integrated Stripe Checkout</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Admin Revenue Charts & Stats</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Real-time low stock warnings</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-md shadow-emerald-500/10"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-400 text-sm tracking-wider uppercase mb-2">Enterprise</p>
                <p className="text-slate-500 text-xs mb-6">Designed for multi-location franchise businesses and warehouse retail chains.</p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl font-extrabold font-mono text-slate-100">${prices.enterprise}</span>
                  <span className="text-slate-500 text-xs font-semibold">/month</span>
                </div>
                <div className="border-t border-slate-800/80 my-6" />
                <ul className="space-y-4 text-xs text-slate-400">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span className="text-slate-200">Everything in Pro Plan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Multi-location shop synchronization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Custom domain checkout portals</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>Priority dedicated developer support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>99.99% Uptime SLA commitment</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-750 transition-colors border border-slate-700 hover:border-slate-600"
                >
                  Contact Sales Team
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CUSTOMER SUCCESS / TESTIMONIALS */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              Trusted Worldwide
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6 text-slate-100">
              Loved by fast-growing brands
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              See how modern shop owners and retailers are scaling transactions and streamlining inventory daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                q: "Quick-Bill revolutionized our coffee shop counters. With multiple cashiers checkout times plummeted below 2 seconds and Stripe payments reduced cash errors to zero.",
                user: "Sarah Jenkins",
                role: "Founder, Brew & Co.",
                badge: "5 registers"
              },
              {
                q: "The real-time stock adjustment triggers have saved us hundreds of dollars in double selling. We get clear low-stock badges prior to running short of peak priority items.",
                user: "Amit Sharma",
                role: "Manager, Metro Grocers",
                badge: "3 registers"
              },
              {
                q: "The visual revenue charts and accounting spreadsheets export from the Admin dashboard are outstanding. Weekly bookkeeping time decreased from 6 hours to 10 minutes.",
                user: "Elena Rostova",
                role: "Director, Moda Boutique",
                badge: "2 registers"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="text-slate-400 text-xs mb-3 flex items-center justify-between">
                  <span className="text-amber-400 text-lg">★★★★★</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-bold">{t.badge}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{t.q}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-850">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                    {t.user.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">{t.user}</h4>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-y border-slate-800 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              Have Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm">
              Quick and clear information on billing, payments, configurations, and terminal hardware.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-sm sm:text-base text-slate-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-xl transform transition-transform duration-300 font-mono ${isOpen ? 'rotate-45 text-emerald-400' : 'text-slate-400'}`}>
                      +
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${isOpen ? 'max-h-[200px] pb-6 opacity-100 border-t border-slate-850 pt-4' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Ready to upgrade your store terminal?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of smart retailers and business owners worldwide who trust Quick-Bill to drive sales, manage stock, and receive credit cards effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-xl shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
              Start Your Free Trial Now
            </Link>
            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-slate-350 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors transform hover:-translate-y-0.5"
            >
              Play with Demo Cart
            </a>
          </div>
          <p className="text-[10px] text-slate-500 mt-6">
            No credit card required. Cancel anytime. Starter plan is free forever.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm">
                QB
              </div>
              <span className="text-lg font-bold text-white tracking-wide">Quick-Bill</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Premium modern POS system designed to maximize transaction speed, maintain real-time inventory levels, and process instant card receipts.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500 text-xs">
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">Twitter</span>
              <span>•</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">GitHub</span>
              <span>•</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">LinkedIn</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest">Product</h4>
            <ul className="space-y-2 text-xs text-slate-450">
              <li><a href="#features" className="hover:text-slate-200 transition-colors">POS Terminal</a></li>
              <li><a href="#simulator" className="hover:text-slate-200 transition-colors">Stripe Billing</a></li>
              <li><a href="#analytics" className="hover:text-slate-200 transition-colors">Analytics Reports</a></li>
              <li><a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing Options</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-450">
              <li><span className="hover:text-slate-200 transition-colors cursor-pointer">Documentation</span></li>
              <li><span className="hover:text-slate-200 transition-colors cursor-pointer">API Reference</span></li>
              <li><span className="hover:text-slate-200 transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-slate-200 transition-colors cursor-pointer">System Status</span></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest">Stay Updated</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to the Quick-Bill newsletter for product updates, marketing insights, and modern retail tips.
            </p>
            
            {subscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl font-bold">
                ✓ Successfully Subscribed! Thank you.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 flex-1"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 transition-colors text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-850 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Quick-Bill POS Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-350 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-350 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-350 transition-colors cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
