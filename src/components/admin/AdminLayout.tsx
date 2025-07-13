import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Star, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout() {
  const { signOutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-100 text-indigo-600' : 'text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-[#D7263D]">Admin Panel</h1>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard')}`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/products')}`}
            >
              <Package className="mr-3 h-5 w-5" />
              Products
            </Link>
            <Link
              to="/admin/orders"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/orders')}`}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Orders
            </Link>
            <Link
              to="/admin/reviews"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/reviews')}`}
            >
              <Star className="mr-3 h-5 w-5" />
              Reviews
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start mt-4 text-gray-700 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 pl-64">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
