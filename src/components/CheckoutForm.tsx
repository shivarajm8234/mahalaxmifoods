import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { loadScript } from '../utils/loadScript';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

interface CheckoutFormProps {
  onCheckout: (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: 'online' | 'cod';
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => Promise<void>;
  loading: boolean;
  onBack: () => void;
  cartTotal: number;
}

export function CheckoutForm({ onCheckout, loading, onBack, cartTotal }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    paymentMethod: 'online' as 'online', // Only online
  });
  const { toast } = useToast();
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);

  // Fetch Razorpay Key ID on mount
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const functions = getFunctions(getApp());
        const getKey = httpsCallable(functions, 'getRazorpayKey');
        const result: any = await getKey();
        setRazorpayKeyId(result.data.keyId);
      } catch (err) {
        toast({
          title: 'Payment Error',
          description: 'Could not fetch payment key. Please try again.',
          variant: 'destructive',
        });
      }
    };
    fetchKey();
  }, []);

  const handleRazorpayPayment = async () => {
    if (!razorpayKeyId) {
      toast({
        title: 'Payment Error',
        description: 'Payment gateway not ready. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    // 1. Create order on backend (Firebase callable)
    let order;
    try {
      const functions = getFunctions(getApp());
      const createOrder = httpsCallable(functions, 'createOrder');
      const res: any = await createOrder({
        amount: Math.round(cartTotal), // amount in INR
        currency: 'INR',
      });
      order = res.data.order;
      if (!order.id) throw new Error('Invalid order response from backend');
    } catch (err: any) {
      toast({
        title: 'Payment Error',
        description: err.message || 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    // 2. Load Razorpay script
    const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!loaded) {
      toast({
        title: 'Payment Error',
        description: 'Failed to load payment gateway. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    // 3. Open Razorpay checkout
    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Shree Mahalaxmi Foods',
      description: 'Order Payment',
      order_id: order.id, // Razorpay order_id from backend
      handler: async function (response: any) {
        // Payment success
        await onCheckout({
          ...formData,
          paymentMethod: 'online',
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: formData.address,
      },
      theme: {
        color: '#FF6B35',
      },
      modal: {
        ondismiss: function () {
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment.',
            variant: 'destructive',
          });
        },
      },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (formData.paymentMethod === 'online') {
      await handleRazorpayPayment();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Shipping Information</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP/Postal Code *</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => setFormData({...formData, zip: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Order Summary</h4>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label>Payment Method *</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <input
                type="radio"
                id="online"
                name="paymentMethod"
                checked={true}
                readOnly
                className="h-4 w-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div>
                <Label htmlFor="online" className="text-sm font-medium leading-none">
                  Pay Online
                </Label>
                <p className="text-xs text-gray-500">Credit/Debit Card, UPI, Net Banking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] h-12 text-base"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {formData.paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
            </div>
          ) : (
            formData.paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="w-full h-12 text-base"
        >
          Back to Cart
        </Button>
      </div>
    </form>
  );
}
