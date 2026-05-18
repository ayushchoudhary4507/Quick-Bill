import React, { useState, useEffect } from 'react';
import { paymentApi } from '../services/api';
import { toast } from 'react-hot-toast';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await paymentApi.getAllPayments();
            setPayments(data.payments);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch admin payment records');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalRevenue: payments.filter(p => p.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0),
        completedCount: payments.filter(p => p.status === 'completed').length,
        pendingCount: payments.filter(p => p.status === 'pending').length,
        failedCount: payments.filter(p => p.status === 'failed').length
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Payment Dashboard</h1>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-500 uppercase font-bold">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500 uppercase font-bold">Successful Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500 uppercase font-bold">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                    <p className="text-sm text-gray-500 uppercase font-bold">Failed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.failedCount}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">User #{payment.user_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.customer_email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(payment.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
