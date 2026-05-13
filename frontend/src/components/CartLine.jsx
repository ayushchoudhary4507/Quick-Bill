/**
 * One cart row with quantity steppers and remove.
 */

import { formatCurrency } from '../utils/formatCurrency.js'

export default function CartLine({ line, onChangeQty, onRemove, disabled }) {
  const lineTotal = Number(line.price) * line.quantity
  const atMin = line.quantity <= 1
  const atMax = line.quantity >= line.stock

  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{line.name}</p>
        <p className="mt-1 text-xs text-slate-600">
          {formatCurrency(line.price)} × {line.quantity} ={' '}
          <span className="font-semibold text-slate-900">
            {formatCurrency(lineTotal)}
          </span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || atMin}
            onClick={() => onChangeQty(line.product_id, line.quantity - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
          <button
            type="button"
            disabled={disabled || atMax}
            onClick={() => onChangeQty(line.product_id, line.quantity + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(line.product_id)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-40"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
