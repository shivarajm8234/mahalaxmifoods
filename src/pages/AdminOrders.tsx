import { useOrders } from "@/contexts/OrderContext";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const statusOptions = [
  "confirmed",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "completed"
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-200 text-green-900"
};

export default function AdminOrders() {
  const { orders, loading, error, updateOrderStatus } = useOrders();
  const { products } = useProducts();
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const { toast } = useToast();

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];

  const getProduct = (productId: string) => products.find(p => p.id === productId);
  const getProductName = (productId: string, fallback?: string) => {
    const found = getProduct(productId);
    return found ? found.title : fallback || productId;
  };
  const getProductImage = (productId: string) => {
    const found = getProduct(productId);
    return found ? found.image : "/placeholder.svg";
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Order Status Updated",
        description: `Order status changed to '${status}'.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: error?.message || "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Filter orders by orderId, product name, and status
  const filteredOrders = orders.filter(order => {
    const searchTerm = search.trim().toLowerCase();
    const matchesOrderId = searchTerm
      ? order.id.toLowerCase().includes(searchTerm)
      : true;
    const matchesProductName = searchTerm
      ? order.items.some(item => {
          const productName = getProductName(item.productId, item.name).toLowerCase();
          return productName.includes(searchTerm);
        })
      : true;
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    return (matchesOrderId || matchesProductName) && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-lg text-gray-600">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">All Orders</h1>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <Input
            type="search"
            placeholder="Search by Order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value.toString()} value={opt.value.toString()}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</CardTitle>
                  <CardDescription className="mt-1">
                    Placed on {(() => {
                      let dateObj: Date | null = null;
                      const raw = order.createdAt;
                      if (raw != null && typeof raw === 'object' && 'seconds' in raw && typeof (raw as any).seconds === 'number') {
                        dateObj = new Date((raw as any).seconds * 1000);
                      } else if (typeof raw === 'string') {
                        const parsed = new Date(raw);
                        if (!isNaN(parsed.getTime())) dateObj = parsed;
                      }
                      return dateObj ? dateObj.toLocaleDateString() : 'Unknown Date';
                    })()}
                  </CardDescription>
                  {order.user && (
                    <div className="mt-2 text-sm text-gray-700">
                      Customer: {order.user.name} ({order.user.email})
                    </div>
                  )}
                  {order.userId && !order.user && (
                    <div className="mt-2 text-sm text-gray-600">User ID: {order.userId}</div>
                  )}
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-4">
                  <Badge className={`capitalize mr-2 ${statusColors[order.status] || ''}`}>{order.status}</Badge>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {["confirmed","pending","processing","shipped","delivered","cancelled","completed"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {updating === order.id && <span className="ml-2 text-xs text-gray-400">Updating...</span>}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={getProductImage(item.productId)} alt={getProductName(item.productId, item.name)} className="h-10 w-10 object-cover rounded" />
                            <span>{getProductName(item.productId, item.name)}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between border-t">
                  <div>
                    <div className="font-semibold">Shipping Address:</div>
                    <div className="text-sm text-gray-700">
                      {[
                        order.shippingAddress?.name,
                        order.shippingAddress?.street,
                        order.shippingAddress?.city,
                        order.shippingAddress?.state,
                        order.shippingAddress?.zip,
                        order.shippingAddress?.country
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 font-bold text-lg">Order Total: ₹{order.total?.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 