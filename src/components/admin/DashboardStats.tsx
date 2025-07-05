import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { Product } from "@/lib/types";
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getTotalUserCount } from '@/services/userActivity';

interface Order {
  id: string;
  total: number;
  createdAt: string;
  [key: string]: any;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
}

const DashboardStats = () => {
  const { products = [] } = useProducts() || {};
  const { orders = [] } = useOrders() || {};
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    productGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    userGrowth: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total users count
        const totalUsers = await getTotalUserCount();
        
        // Calculate total orders and revenue
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: Order) => 
          sum + (typeof order.total === 'number' ? order.total : 0), 0);
        
        // Calculate growth percentages (month over month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Calculate order growth
        const currentMonthOrders = orders.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        });

        const prevMonthOrders = orders.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === prevMonth && 
                 orderDate.getFullYear() === prevYear;
        });

        const orderGrowth = prevMonthOrders.length > 0 
          ? Math.round(((currentMonthOrders.length - prevMonthOrders.length) / prevMonthOrders.length) * 100)
          : currentMonthOrders.length > 0 ? 100 : 0;
        
        // Calculate revenue growth
        const currentMonthRevenue = currentMonthOrders.reduce(
          (sum: number, order: Order) => sum + (typeof order.total === 'number' ? order.total : 0), 0);
        
        const prevMonthRevenue = prevMonthOrders.reduce(
          (sum: number, order: Order) => sum + (typeof order.total === 'number' ? order.total : 0), 0);
        
        const revenueGrowth = prevMonthRevenue > 0 
          ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
          : currentMonthRevenue > 0 ? 100 : 0;
        
        // Calculate user growth (simplified - in a real app, you'd track this over time)
        const userGrowth = 5; // Placeholder - would come from historical user data
        
        setStats({
          totalProducts: products.length,
          totalOrders,
          totalRevenue,
          activeUsers: totalUsers,
          productGrowth: 12, // Placeholder - would track product additions over time
          orderGrowth,
          revenueGrowth,
          userGrowth: 5 // Placeholder growth for users
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [products, orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      change: stats.productGrowth,
      icon: <Package className="h-5 w-5 text-muted-foreground" />,
      description: `${stats.productGrowth >= 0 ? '+' : ''}${stats.productGrowth}% from last month`
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: stats.orderGrowth,
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />,
      description: `${stats.orderGrowth >= 0 ? '+' : ''}${stats.orderGrowth}% from last month`
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueGrowth,
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
      description: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}% from last month`
    },
    {
      title: "Total Users",
      value: stats.activeUsers.toLocaleString(),
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      description: `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth}% from last month`
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-5 w-5 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="h-5 w-5 text-muted-foreground">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.title === 'Total Revenue' 
                ? formatCurrency(parseFloat(stat.value.replace(/[^0-9.]/g, '')))
                : stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
