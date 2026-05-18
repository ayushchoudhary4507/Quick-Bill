/**
 * Product tile in the searchable catalog grid.
 */

import { formatCurrency } from '../utils/formatCurrency.js'

export default function ProductCard({ product, onAdd, disabled }) {
  const stockToDisplay = product.availableStock !== undefined ? product.availableStock : product.stock
  const out = stockToDisplay === 0

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-semibold opacity-50">{product.name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold text-slate-900">
        {product.name}
      </h3>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-lg font-bold text-emerald-700">
          {formatCurrency(product.price)}
        </p>
        <p
          className={`text-xs font-medium ${out ? 'text-rose-600' : 'text-slate-600'}`}
        >
          {out ? 'Out of stock' : `${stockToDisplay} in stock`}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled || out}
        onClick={() => onAdd(product)}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        {out ? 'Unavailable' : 'Add to cart'}
      </button>
    </article>
  )
}
