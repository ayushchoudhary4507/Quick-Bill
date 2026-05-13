/**
 * Top navigation for the POS shell.
 */

import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ')

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            QB
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Quick-Bill</p>
            <p className="text-xs text-slate-500">Point of Sale</p>
          </div>
        </div>
        <nav className="flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" className={linkClass} end>
            Register
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            Sales history
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
