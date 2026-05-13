/**
 * Read-only transaction history from GET /sales.
 */

import { useCallback, useEffect, useState } from 'react'
import Loader from '../components/Loader.jsx'
import Toast from '../components/Toast.jsx'
import { salesApi } from '../services/api.js'
import { formatCurrency } from '../utils/formatCurrency.js'

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await salesApi.list()
      setSales(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load sales')
      setToast({ message: e.message || 'Failed to load sales', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales history</h1>
          <p className="text-sm text-slate-600">
            Recent checkouts recorded by the backend.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <Loader text="Loading sales…" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No sales yet — complete a checkout on the Register tab.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Sale</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900">#{s.id}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(s.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <ul className="space-y-1">
                        {s.items.map((it) => (
                          <li key={it.id} className="text-xs sm:text-sm">
                            <span className="font-medium text-slate-900">
                              {it.product_name || `Product #${it.product_id}`}
                            </span>
                            <span className="text-slate-600">
                              {' '}
                              × {it.quantity} @ {formatCurrency(it.price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
