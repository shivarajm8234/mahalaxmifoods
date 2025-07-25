import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Star, TrendingUp, Users, DollarSign } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalytics = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const [salesData, setSalesData] = useState<Array<{name: string; sales: number}>>([]);
  const [revenueData, setRevenueData] = useState<Array<{name: string; revenue: number}>>([]);
  const [productSales, setProductSales] = useState<Array<{name: string; value: number}>>([]);

  useEffect(() => {
    // Process sales data
    setSalesData(getMonthlySales(orders));

    // Process revenue data
    setRevenueData(getMonthlyRevenue(orders));

    // Process product sales
    setProductSales(getTopProductSales(products, orders));
  }, [orders, products]);

  function getMonthlySales(orders) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = Array(12).fill(0);
    orders.forEach(order => {
      const d = new Date(order.createdAt);
      salesByMonth[d.getMonth()] += 1;
    });
    return months.map((name, i) => ({ name, sales: salesByMonth[i] }));
  }

  function getMonthlyRevenue(orders) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = Array(12).fill(0);
    orders.forEach(order => {
      const d = new Date(order.createdAt);
      revenueByMonth[d.getMonth()] += order.total || 0;
    });
    return months.map((name, i) => ({ name, revenue: revenueByMonth[i] }));
  }

  function getTopProductSales(products, orders) {
    const salesMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
      });
    });
    return products.map(product => ({
      name: product.title,
      value: salesMap[product.id] || 0
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }

  const stats = [
    { title: 'Total Products', value: products.length, icon: <Package className="h-6 w-6" />, trend: '+12%' },
    { title: 'Total Orders', value: orders.length, icon: <ShoppingCart className="h-6 w-6" />, trend: '+8%' },
    { title: 'Total Revenue', value: `₹${orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: <DollarSign className="h-6 w-6" />, trend: '+15%' },
    { title: 'Active Users', value: '1,234', icon: <Users className="h-6 w-6" />, trend: '+5%' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productSales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {productSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status || 'Processing'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
