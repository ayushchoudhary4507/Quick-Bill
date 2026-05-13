/**
 * Temporary toast notifications for success / error feedback.
 */

import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  const styles =
    type === 'success'
      ? 'bg-emerald-600'
      : type === 'error'
        ? 'bg-rose-600'
        : 'bg-slate-800'

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex max-w-md animate-slide-in items-start gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${styles}`}
      role="status"
    >
      <span className="mt-0.5 font-semibold" aria-hidden>
        {type === 'success' ? '✓' : '!'}
      </span>
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded px-1 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}
