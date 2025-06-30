import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TestPayment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(10); // Default amount in INR
  const { currentUser } = useAuth();
  const functions = getFunctions();
  const createRazorpayOrder = httpsCallable(functions, 'createOrder');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async (order: any) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Shree Mahalaxmi Foods',
      description: 'Order Payment',
      order_id: order.id,
      handler: async function (response: any) {
        // Payment successful
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        // Here you can update your order status in Firestore
      },
      prefill: {
        name: currentUser?.displayName || 'Customer',
        email: currentUser?.email || '',
        contact: currentUser?.phoneNumber || '',
      },
      theme: {
        color: '#F37254',
      },
      modal: {
        ondismiss: function () {
          // Handle modal dismissal
          console.log('Payment modal dismissed');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayment = async () => {
    if (!currentUser) {
      alert('Please sign in to make a payment');
      return;
    }

    setLoading(true);
    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order using Firebase Cloud Function
      const result = await createRazorpayOrder({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
      });

      // @ts-ignore
      const order = result.data.order;
      
      // Display Razorpay payment form
      await displayRazorpay(order);
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test Razorpay Payment</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
          Amount (INR)
        </label>
        <input
          type="number"
          id="amount"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Test Card: 4111 1111 1111 1111 | Any future date | Any CVV | Any name
      </p>
    </div>
  );
};

export default TestPayment;
