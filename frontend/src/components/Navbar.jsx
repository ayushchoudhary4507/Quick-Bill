import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ')

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            QB
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-semibold text-slate-900">Quick-Bill</p>
            <p className="text-xs text-slate-500">Point of Sale</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1" aria-label="Primary">
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            Sales history
          </NavLink>
          <NavLink to="/payment/history" className={linkClass}>
            My Payments
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
