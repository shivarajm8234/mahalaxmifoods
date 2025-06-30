import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';

interface CheckoutFormProps {
  onCheckout: (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: 'online' | 'cod';
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
    paymentMethod: 'online' as 'online' | 'cod',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    await onCheckout(formData);
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
          <Label htmlFor="address">Shipping Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                checked={formData.paymentMethod === 'online'}
                onChange={() => setFormData({...formData, paymentMethod: 'online'})}
                className="h-4 w-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div>
                <Label htmlFor="online" className="text-sm font-medium leading-none">
                  Pay Online
                </Label>
                <p className="text-xs text-gray-500">Credit/Debit Card, UPI, Net Banking</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                checked={formData.paymentMethod === 'cod'}
                onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                className="h-4 w-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div>
                <Label htmlFor="cod" className="text-sm font-medium leading-none">
                  Cash on Delivery
                </Label>
                <p className="text-xs text-gray-500">Pay when you receive your order</p>
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
