import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-t-8 border-red-500">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
                <p className="text-gray-600 mb-8">
                    Your payment process was cancelled. No charges were made to your account.
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/pricing')}
                        className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-white text-gray-700 font-semibold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
