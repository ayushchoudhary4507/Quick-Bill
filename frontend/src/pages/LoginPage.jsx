import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(username, password);
            if (data && data.access_token) {
                const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                if (payload.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/products');
                }
            } else {
                navigate('/products');
            }
        } catch (err) {
            setToast({ message: err.message || 'Login failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setToast({ message: 'Please enter username and password', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            await register(username, password);
            setToast({ message: 'Registration successful! You can now login.', type: 'success' });
        } catch (err) {
            setToast({ message: err.message || 'Registration failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                        Quick-Bill POS
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Login or Sign up to access your terminal
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 shadow-md"
                        >
                            {loading ? 'Processing...' : 'Login'}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={loading}
                            className="flex-1 flex justify-center py-2.5 px-4 border border-emerald-600 text-sm font-semibold rounded-lg text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
