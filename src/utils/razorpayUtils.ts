import { loadScript } from '@/utils/loadScript';

declare global {
  interface Window {
    Razorpay: any; // Razorpay types would be better here if available
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: any[];
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: any;
  error?: {
    description: string;
  };
}

export const initializeRazorpay = async (): Promise<boolean> => {
  try {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      return true;
    }
    
    // Verify the API key is available
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log('Razorpay key ID:', keyId ? '***' + keyId.slice(-4) : 'Not found');
    
    if (!keyId) {
      console.error('Razorpay key ID is not configured. Please check your .env file');
      return false;
    }
    
    console.log('Loading Razorpay script...');
    await loadScript(RAZORPAY_SCRIPT_URL);
    
    // Add a small delay to ensure Razorpay is properly initialized
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify Razorpay is properly loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay script loaded but window.Razorpay is not available');
    }
    
    console.log('Razorpay initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    return false;
  }
};

export const createRazorpayOrder = async (amount: number, receipt: string): Promise<RazorpayOrderResponse> => {
  try {
    console.log('Creating Razorpay order with amount:', amount, 'receipt:', receipt);
    
    // Call the Firebase Function to create the order
    const response = await fetch('https://us-central1-shree-mahalaxmi-foods-products.cloudfunctions.net/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: receipt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create Razorpay order:', error);
      throw new Error(error.message || 'Failed to create order');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create order');
    }

    console.log('Razorpay order created:', result.order);
    return result.order as RazorpayOrderResponse;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const processRazorpayPayment = async (
  orderId: string,
  amount: number,
  receipt: string,
  userData: {
    name?: string;
    email?: string;
    phone?: string;
    shippingAddress?: string;
  },
  onSuccess: (paymentId: string) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    // Load Razorpay script if not already loaded
    const razorpayLoaded = await initializeRazorpay();
    if (!razorpayLoaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Create a new Razorpay order through our Firebase Function
    const order = await createRazorpayOrder(amount, receipt);
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Mahalaxmi Foods',
      description: 'Payment for your order',
      image: '/logo.png',
      order_id: order.id,
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          // Call our backend to verify the payment
          const verificationResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            }),
          });

          if (!verificationResponse.ok) {
            const error = await verificationResponse.json();
            throw new Error(error.message || 'Payment verification failed');
          }

          const result = await verificationResponse.json();
          if (result.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            throw new Error(result.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Error in payment handler:', error);
          onError(error instanceof Error ? error : new Error('Payment processing failed'));
        }
      },
      prefill: {
        name: userData.name || '',
        email: userData.email || '',
        contact: userData.phone || '',
      },
      notes: {
        address: userData.shippingAddress || '',
        order_id: orderId,
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function() {
          onError(new Error('Payment window closed by user'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function(response: any) {
      console.error('Payment failed:', response.error);
      onError(new Error(response.error.description || 'Payment failed'));
    });
    
    // Log order details for debugging
    console.log('Razorpay order details:', {
      orderId: options.order_id,
      amount: options.amount,
      currency: options.currency
    });
    
    rzp.open();

    // @ts-ignore - Razorpay is loaded dynamically
    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on('payment.failed', function(response: RazorpayError) {
      console.error('Payment failed with error:', {
        code: response.code,
        description: response.description,
        source: response.source,
        step: response.step,
        reason: response.reason,
      });
      
      const errorMessage = response.description || 
                         response.error?.description || 
                         'Payment was not successful. Please try again.';
      onError(new Error(errorMessage));
    });

    paymentObject.on('payment.authorized', function(response: RazorpayPaymentResponse) {
      console.log('Payment authorized successfully:', {
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id
      });
    });

    // Add a small delay to ensure all event listeners are properly attached
    setTimeout(() => {
      try {
        console.log('Opening Razorpay payment modal...');
        paymentObject.open();
      } catch (error) {
        console.error('Error opening Razorpay modal:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to open payment modal';
        onError(new Error(`Payment initialization failed: ${errorMessage}`));
      }
    }, 300);
  } catch (error) {
    console.error('Error in processRazorpayPayment:', error);
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
};

export const verifyRazorpayPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> => {
  // In a real app, you would verify the payment signature on your backend
  // This is a mock implementation that always returns true for testing
  console.log(`Verifying payment: orderId=${orderId}, paymentId=${paymentId}`);
  return true;
};
