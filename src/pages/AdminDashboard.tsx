import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { UserCircle, LayoutDashboard, Star, ShoppingCart, BarChart2, MessageCircle } from "lucide-react";
import { useOrders, useProducts } from "@/contexts/ProductContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMemo } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthlyAnalytics(products, orders) {
  const now = new Date();
  const year = now.getFullYear();
  const monthly = months.map((month, idx) => {
    // Products added this month
    const productCount = products.filter(p => {
      const d = new Date(p.createdAt);
      return d.getFullYear() === year && d.getMonth() === idx;
    }).length;
    // Orders placed this month
    const orderList = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === year && d.getMonth() === idx;
    });
    const userCount = 0; // Placeholder, update if you have user registration
    const sales = orderList.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);
    return {
      month,
      products: productCount,
      users: userCount,
      sales,
    };
  });
  return monthly;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { products } = useProducts();
  const analyticsData = useMemo(() => getMonthlyAnalytics(products, orders), [products, orders]);

  const handleLogout = () => {
    navigate("/admin");
  };

  const handleManageProducts = () => {
    navigate("/admin/products");
  };

  const handleViewOrders = () => {
    navigate("/admin/orders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-10 px-6">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-10 w-10 text-black dark:text-white drop-shadow-lg" />
            <h1 className="text-5xl font-extrabold text-black dark:text-white drop-shadow-lg flex items-center gap-2 mb-2">
              <span>Admin Dashboard</span>
            </h1>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-400 rounded mb-8"></div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="secondary" className="shadow-md">
              View Website
            </Button>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800 px-3 py-1 rounded-full shadow">
              <UserCircle className="h-7 w-7 text-black dark:text-white" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Admin</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="shadow-md">
              Logout
            </Button>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 my-8"></div>
        <div className="mb-12 bg-gradient-to-br from-white via-gray-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-8">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Monthly Product Growth</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="products" stroke="#000" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Monthly User Growth</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Monthly Sales (₹)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <Card className="transition-transform duration-200 hover:scale-[1.04] hover:shadow-2xl rounded-2xl p-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <ShoppingCart className="h-6 w-6 text-black dark:text-white" />
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardDescription className="mb-4">Manage your products</CardDescription>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add, edit, or remove products from your inventory
              </p>
              <Button className="mt-2 bg-black text-white font-bold shadow-lg hover:bg-gray-900 transition-colors duration-200 border-0" onClick={handleManageProducts}>
                Add the Product to Website
              </Button>
            </CardContent>
          </Card>
          <Card className="transition-transform duration-200 hover:scale-[1.04] hover:shadow-2xl rounded-2xl p-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <BarChart2 className="h-6 w-6 text-black dark:text-white" />
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardDescription className="mb-4">View and manage orders</CardDescription>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Track order status and manage customer orders
              </p>
              <Button className="mt-2 bg-black text-white font-bold shadow-lg hover:bg-gray-900 transition-colors duration-200 border-0" onClick={handleViewOrders}>
                View Orders
              </Button>
            </CardContent>
          </Card>
          <Card className="transition-transform duration-200 hover:scale-[1.04] hover:shadow-2xl rounded-2xl p-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <MessageCircle className="h-6 w-6 text-black dark:text-white" />
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardDescription className="mb-4">Customer reviews</CardDescription>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Moderate and respond to customer reviews
              </p>
              <Button className="mt-2 bg-black text-white font-bold shadow-lg hover:bg-gray-900 transition-colors duration-200 border-0" onClick={() => navigate('/admin/reviews')}>
                Manage Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 