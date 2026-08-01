// Payment integration added
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import { CartProvider } from './context/CartProvider.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PosPage from './pages/PosPage.jsx'
import SalesHistoryPage from './pages/SalesHistoryPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Loader from './components/Loader.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import PaymentCancel from './pages/PaymentCancel.jsx'
import PaymentHistory from './pages/PaymentHistory.jsx'
import AdminPayments from './pages/AdminPayments.jsx'

import { Toaster } from 'react-hot-toast'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <Loader text="Checking authentication..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/products" replace />;
  
  return children;
}

function HomeRedirect() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loader text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/products" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <div className="min-h-screen bg-slate-50">
            <NavbarWrapper />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<HomeRedirect />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <PosPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sales" 
                  element={
                    <ProtectedRoute>
                      <SalesHistoryPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment/success" 
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment/cancel" 
                  element={
                    <ProtectedRoute>
                      <PaymentCancel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment/history" 
                  element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/payments" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPayments />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

function NavbarWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navbar />;
}
