/**
 * Main POS screen: searchable catalog + cart + checkout.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import CartLine from '../components/CartLine.jsx'
import Loader from '../components/Loader.jsx'
import ProductCard from '../components/ProductCard.jsx'

import Toast from '../components/Toast.jsx'
import { useCart } from '../hooks/useCart.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import { checkoutApi, productsApi, paymentApi } from '../services/api.js'
import { formatCurrency } from '../utils/formatCurrency.js'

export default function PosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')


  const debouncedSearch = useDebouncedValue(search, 200)

  const {
    lines,
    subtotal,
    grandTotal,
    itemCount,
    addProduct,
    removeLine,
    setQuantity,
    clear,
  } = useCart()

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const refreshProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setLoadError(null)
    try {
      const data = await productsApi.list()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      if (!silent) {
        setLoadError(e.message || 'Failed to load products')
        showToast(e.message || 'Failed to load products', 'error')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // Initial fetch
    refreshProducts()

    // 1. Polling every 3 seconds for real-time stock sync (silent)
    const pollInterval = setInterval(() => {
      void refreshProducts(true)
    }, 3000)

    // 2. Refresh when the tab/window gains focus
    const handleFocus = () => refreshProducts(true)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshProducts])

  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()

    // Calculate available stock by subtracting cart quantities
    const baseProducts = products.map(p => {
      const cartLine = lines.find(l => l.product_id === p.id);
      const inCartQty = cartLine ? cartLine.quantity : 0;
      return {
        ...p,
        availableStock: p.stock - inCartQty
      };
    });

    if (!q) return baseProducts;
    return baseProducts.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, debouncedSearch, lines])

  const handleAdd = useCallback(
    (product) => {
      if (product.stock === 0) {
        showToast('This product is out of stock.', 'error')
        return
      }
      const existing = lines.find((l) => l.product_id === product.id)
      if (existing && existing.quantity >= product.stock) {
        showToast('Cannot add more than available stock.', 'error')
        return
      }
      addProduct(product)
      showToast(`${product.name} added to cart`, 'success')
    },
    [addProduct, lines, showToast],
  )

  const handleChangeQty = useCallback(
    (productId, nextQty) => {
      const line = lines.find((l) => l.product_id === productId)
      const product = products.find((p) => p.id === productId)
      if (!line || !product) return

      if (nextQty < 1) {
        showToast('Quantity must be at least 1.', 'error')
        return
      }
      if (nextQty > product.stock) {
        showToast('Quantity exceeds available stock.', 'error')
        return
      }
      setQuantity(productId, nextQty)
    },
    [lines, products, setQuantity, showToast],
  )

  const handleCheckout = async () => {
    if (lines.length === 0) {
      showToast('Your cart is empty.', 'error')
      return
    }

    setCheckoutLoading(true)
    try {
      const payload = lines.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
      }))
      const result = await checkoutApi.checkout(payload)
      showToast(
        `Sale #${result.sale_id ?? ''} complete — ${formatCurrency(
          result.total_amount ?? result.total,
        )}`,
        'success',
      )
      clear()
      await refreshProducts()
    } catch (e) {
      showToast(e.message || 'Checkout failed', 'error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (lines.length === 0) {
      showToast('Your cart is empty.', 'error')
      return
    }

    setCheckoutLoading(true)
    try {
      const items = lines.map((l) => ({
        product_id: l.product_id,
        product_name: l.name,
        amount: l.price,
        quantity: l.quantity,
      }))

      const response = await paymentApi.createCheckoutSession({
        items,
        currency: 'usd'
      })

      if (response.checkout_url) {
        window.location.href = response.checkout_url
      }
    } catch (e) {
      showToast(e.message || 'Stripe Checkout failed', 'error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">
            Search products, build a cart, and check out in one flow.
          </p>
        </div>
        <label className="block w-full max-w-xl mx-auto">
          <span className="sr-only">Search products</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder=" Search products…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-emerald-600/40 placeholder:text-slate-400 focus:ring-2 focus:border-emerald-500 transition-shadow"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Products
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {filteredProducts.length} shown
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshProducts}
                disabled={loading}
                className="group flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:shadow active:scale-95 disabled:opacity-50"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
              <Loader text="Loading catalog…" />
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-semibold">Could not load products</p>
              <p className="mt-1">{loadError}</p>
              <button
                type="button"
                onClick={refreshProducts}
                className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              No products match your search.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={handleAdd}
                  disabled={checkoutLoading}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Cart
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {itemCount} items
              </span>
            </div>

            {lines.length === 0 ? (
              <p className="mt-6 text-center text-sm text-slate-600">
                Cart is empty — add products from the catalog.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                  {lines.map((line) => (
                    <CartLine
                      key={line.product_id}
                      line={line}
                      onChangeQty={handleChangeQty}
                      onRemove={removeLine}
                      disabled={checkoutLoading}
                    />
                  ))}
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Grand total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Processing…
                    </>
                  ) : (
                    'Direct Checkout (Cash)'
                  )}
                </button>

                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleStripeCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    'Pay with Stripe (Card)'
                  )}
                </button>

                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => clear()}
                  className="w-full rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Clear cart
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>


    </div>
  )
}
