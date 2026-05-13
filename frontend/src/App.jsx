/**
 * Application shell: navigation + routed pages.
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import { CartProvider } from './context/CartProvider.jsx'
import PosPage from './pages/PosPage.jsx'
import SalesHistoryPage from './pages/SalesHistoryPage.jsx'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<PosPage />} />
              <Route path="/sales" element={<SalesHistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}
