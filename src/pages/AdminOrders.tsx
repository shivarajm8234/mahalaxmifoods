import { useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans py-10">
      <div className="max-w-5xl mx-auto bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-3xl font-extrabold text-black dark:text-white ml-2">Orders</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Items</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-indigo-50/40 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-2">{order.user.name}</td>
                    <td className="px-4 py-2">{order.user.email}</td>
                    <td className="px-4 py-2">{order.address}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc pl-4">
                        {order.items.map(item => (
                          <li key={item.productId}>
                            {item.title} <span className="text-gray-500">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 