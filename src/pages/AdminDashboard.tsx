import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Star, BarChart2, Plus, ArrowRight } from "lucide-react";
import AdminAnalytics from "./AdminAnalytics";

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DashboardCard = ({
  title,
  description,
  buttonText,
  icon,
  onClick,
}: DashboardCardProps) => (
  <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
      <CardDescription className="text-base text-gray-600 dark:text-gray-300">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="mt-auto pt-0">
      <Button 
        onClick={onClick} 
        variant="outline"
        className="w-full justify-between group"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.includes('analytics') ? 'analytics' : 'overview';

  const cards = [
    {
      title: "Products",
      description: "Add, edit, or remove products from your inventory",
      buttonText: "Manage Products",
      icon: <Package className="h-5 w-5" />,
      onClick: () => navigate("/admin/products")
    },
    {
      title: "Orders",
      description: "Track order status and manage customer orders",
      buttonText: "View Orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate("/admin/orders")
    },
    {
      title: "Reviews",
      description: "Moderate and respond to customer reviews",
      buttonText: "Manage Reviews",
      icon: <Star className="h-5 w-5" />,
      onClick: () => navigate("/admin/reviews")
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your store's products, orders, and customer interactions
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => navigate('/admin/dashboard')}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" onClick={() => navigate('/admin/dashboard/analytics')}>
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
