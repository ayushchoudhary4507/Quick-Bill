import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paymentApi, productsApi } from '../services/api';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    const [verifying, setVerifying] = React.useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            if (sessionId) {
                try {
                    await paymentApi.verifySession(sessionId);
                    
                    // Clear cart data from localStorage
                    localStorage.removeItem('quick-bill-cart'); // Adjust key if different
                    localStorage.removeItem('cart');
                    
                    // Refresh products in catalog after confirmation
                    await productsApi.list(); 
                    toast.success('Payment confirmed! Stock updated.', {
                        duration: 5000,
                        icon: ''
                    });
                } catch (error) {
                    console.error('Verification failed:', error);
                } finally {
                    setVerifying(false);
                }
            } else {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your transaction was completed successfully. 
                    {sessionId && <span className="block mt-2 text-sm text-gray-400 font-mono">Session ID: {sessionId.substring(0, 20)}...</span>}
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        Go to Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/payment/history')}
                        className="w-full bg-white text-gray-700 font-semibold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        View Payment History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
