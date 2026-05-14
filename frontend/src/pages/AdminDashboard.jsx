import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi, salesApi, productsApi } from '../services/api';
import Loader from '../components/Loader';
import ProductModal from '../components/ProductModal';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        topProducts: [],
        lowStockProducts: [],
        allProducts: [],
        allSales: [],
    });
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState(null); // 'revenue' | 'transactions' | 'lowstock' | 'products'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState(null);

    const panelRef = useRef(null);

    const fetchStats = async () => {
        try {
            const [sales, top, products] = await Promise.all([
                salesApi.list(),
                analyticsApi.topProducts(),
                productsApi.list()
            ]);

            const revenue = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
            const lowStock = products.filter(p => p.stock < 10);

            setStats({
                totalRevenue: revenue,
                totalTransactions: sales.length,
                topProducts: top,
                lowStockProducts: lowStock,
                allProducts: products,
                allSales: sales,
            });
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsApi.delete(id);
                showToast('Product deleted successfully');
                fetchStats();
            } catch (err) {
                showToast(err.message || 'Failed to delete product', 'error');
            }
        }
    };

    // Scroll to expanded panel when opened
    useEffect(() => {
        if (activePanel && panelRef.current) {
            panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activePanel]);

    const togglePanel = (panel) => {
        setActivePanel(prev => prev === panel ? null : panel);
    };

    if (loading) return <Loader text="Loading Dashboard..." />;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            
            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchStats}
                showToast={showToast}
                product={editingProduct}
            />

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">Overview of your business performance</p>
                </div>
                <button 
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-base font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 ring-1 ring-emerald-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Product
                </button>
            </header>

            {/* Quick Stats - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(stats.totalRevenue)} 
                    icon={<RevenueIcon />} 
                    color="bg-emerald-100 text-emerald-700"
                    active={activePanel === 'revenue'}
                    onClick={() => togglePanel('revenue')}
                />
                <StatCard 
                    title="Total Transactions" 
                    value={stats.totalTransactions} 
                    icon={<TransactionIcon />} 
                    color="bg-blue-100 text-blue-700"
                    active={activePanel === 'transactions'}
                    onClick={() => togglePanel('transactions')}
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats.lowStockProducts.length} 
                    icon={<LowStockIcon />} 
                    color="bg-amber-100 text-amber-700"
                    active={activePanel === 'lowstock'}
                    onClick={() => togglePanel('lowstock')}
                />
                <StatCard 
                    title="Total Products" 
                    value={stats.allProducts.length} 
                    icon={<ProductsIcon />} 
                    color="bg-purple-100 text-purple-700"
                    active={activePanel === 'products'}
                    onClick={() => togglePanel('products')}
                />
            </div>

            {/* Expandable Detail Panels */}
            {activePanel && (
                <div ref={panelRef} className="animate-fadeIn">
                    {activePanel === 'revenue' && (
                        <DetailPanel title="Revenue Breakdown" icon={<RevenueIcon />} color="border-emerald-300 bg-emerald-50" onClose={() => setActivePanel(null)}>
                            {stats.allSales.length === 0 ? (
                                <p className="text-slate-500 italic">No sales recorded yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-emerald-100/50 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                                            <tr>
                                                <th className="px-4 py-3">Sale #</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Amount</th>
                                                <th className="px-4 py-3">Items</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-emerald-100">
                                            {stats.allSales.map(s => (
                                                <tr key={s.id} className="hover:bg-emerald-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">#{s.id}</td>
                                                    <td className="px-4 py-3 text-slate-700">{formatDate(s.created_at)}</td>
                                                    <td className="px-4 py-3 font-medium text-emerald-700">{formatCurrency(s.total_amount)}</td>
                                                    <td className="px-4 py-3 text-slate-600">{s.items?.length || 0} items</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="mt-4 flex justify-between items-center px-4 py-3 bg-emerald-100/30 rounded-b-xl">
                                        <span className="font-bold text-emerald-800">Grand Total</span>
                                        <span className="text-lg font-bold text-emerald-700">{formatCurrency(stats.totalRevenue)}</span>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => navigate('/sales')} className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors">
                                View full Sales History →
                            </button>
                        </DetailPanel>
                    )}

                    {activePanel === 'transactions' && (
                        <DetailPanel title="Transaction Details" icon={<TransactionIcon />} color="border-blue-300 bg-blue-50" onClose={() => setActivePanel(null)}>
                            {stats.allSales.length === 0 ? (
                                <p className="text-slate-500 italic">No transactions recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.allSales.map(s => (
                                        <div key={s.id} className="bg-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-slate-900">Sale #{s.id}</span>
                                                <span className="text-xs text-slate-500">{formatDate(s.created_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">{s.items?.length || 0} items purchased</span>
                                                <span className="font-semibold text-blue-700">{formatCurrency(s.total_amount)}</span>
                                            </div>
                                            {s.items && s.items.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-blue-50">
                                                    <ul className="space-y-1">
                                                        {s.items.map(it => (
                                                            <li key={it.id} className="text-xs text-slate-500 flex justify-between">
                                                                <span>{it.product_name || `Product #${it.product_id}`} × {it.quantity}</span>
                                                                <span>{formatCurrency(it.price * it.quantity)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => navigate('/sales')} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                View full Sales History →
                            </button>
                        </DetailPanel>
                    )}

                    {activePanel === 'lowstock' && (
                        <DetailPanel title="Low Stock Inventory" icon={<LowStockIcon />} color="border-amber-300 bg-amber-50" onClose={() => setActivePanel(null)}>
                            {stats.lowStockProducts.length === 0 ? (
                                <p className="text-slate-500 italic">All products are well-stocked!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {stats.lowStockProducts.map((p, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-amber-200 hover:shadow-md transition-shadow flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">{p.name}</p>
                                                <p className="text-xs text-slate-500">{formatCurrency(p.price)} per unit</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${p.stock <= 3 ? 'text-rose-600' : 'text-amber-600'}`}>{p.stock}</p>
                                                <p className="text-xs text-slate-500">remaining</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => navigate('/')} className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-800 hover:underline transition-colors">
                                Go to Register →
                            </button>
                        </DetailPanel>
                    )}

                    {activePanel === 'products' && (
                        <DetailPanel 
                            title="All Products" 
                            icon={<ProductsIcon />} 
                            color="border-purple-300 bg-purple-50" 
                            onClose={() => setActivePanel(null)}
                            headerExtra={
                                <button 
                                    onClick={handleAddProduct}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Add Product
                                </button>
                            }
                        >
                            {stats.allProducts.length === 0 ? (
                                <p className="text-slate-500 italic">No products in inventory.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-purple-100/50 text-xs font-semibold uppercase tracking-wide text-purple-800">
                                            <tr>
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3">Stock</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100">
                                            {stats.allProducts.map(p => (
                                                <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-500">{p.id}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                                                    <td className="px-4 py-3 text-slate-700">{formatCurrency(p.price)}</td>
                                                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                                                    <td className="px-4 py-3">
                                                        {p.stock === 0 ? (
                                                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">Out of Stock</span>
                                                        ) : p.stock < 10 ? (
                                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Low Stock</span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">In Stock</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-2">
                                                        <button 
                                                            onClick={() => handleEditProduct(p)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteProduct(p.id)}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                            title="Delete Product"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <button onClick={() => navigate('/register')} className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                                Go to Register →
                            </button>
                        </DetailPanel>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Top 5 Best Sellers</h2>
                    <div className="space-y-4">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-slate-500 italic">No sales data yet.</p>
                        ) : (
                            stats.topProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold">{i + 1}</span>
                                        <span className="font-medium text-slate-700">{p.product_name}</span>
                                    </div>
                                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">{p.total_sold} units</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Low Stock Alerts</h2>
                    <div className="space-y-4">
                        {stats.lowStockProducts.length === 0 ? (
                            <p className="text-slate-500 italic">No low stock items currently.</p>
                        ) : (
                            stats.lowStockProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                                    <span className="font-medium text-rose-700">{p.name}</span>
                                    <span className="text-rose-600 font-bold">{p.stock} left</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Detail Panel ── */
function DetailPanel({ title, icon, color, onClose, headerExtra, children }) {
    return (
        <div className={`rounded-2xl border-2 ${color} p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center">{icon}</span>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                </div>
                <div className="flex items-center gap-4">
                    {headerExtra}
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                        title="Close panel"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
}

/* ── Stat Card ── */
function StatCard({ title, value, icon, color, active, onClick }) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${active ? 'border-slate-400 ring-2 ring-slate-300 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${active ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
    );
}

/* ── SVG Icons ── */
function RevenueIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    );
}

function TransactionIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    );
}

function LowStockIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    );
}

function ProductsIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    );
}

/* ── Helpers ── */
function formatDate(iso) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}
