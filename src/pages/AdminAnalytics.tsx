import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockData = [
  { month: 'Jan', products: 10, users: 20, sales: 5000 },
  { month: 'Feb', products: 15, users: 35, sales: 8000 },
  { month: 'Mar', products: 20, users: 50, sales: 12000 },
  { month: 'Apr', products: 25, users: 70, sales: 18000 },
  { month: 'May', products: 30, users: 90, sales: 25000 },
  { month: 'Jun', products: 35, users: 120, sales: 32000 },
  { month: 'Jul', products: 40, users: 150, sales: 40000 },
  { month: 'Aug', products: 45, users: 180, sales: 47000 },
  { month: 'Sep', products: 50, users: 210, sales: 54000 },
  { month: 'Oct', products: 55, users: 250, sales: 60000 },
  { month: 'Nov', products: 60, users: 300, sales: 70000 },
  { month: 'Dec', products: 65, users: 350, sales: 80000 },
];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans py-10">
      <div className="max-w-5xl mx-auto bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500 ml-2">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">Monthly Product Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="products" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-pink-700 dark:text-pink-300">Monthly User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4 text-yellow-700 dark:text-yellow-300">Monthly Sales (₹)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#f59e42" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 