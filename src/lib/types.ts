export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  gst: number;
  shippingFee: number;
  image: string;
  badge?: string;
  status?: 'active' | 'archived';
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
  response?: string;
  adminReply?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  gst?: number;
  shippingFee?: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string };
}