import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { OrdersPage } from "@/pages/orders/OrdersPage";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageProducts from "@/pages/ManageProducts";
import ManageReviews from "@/pages/ManageReviews";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Footer from "@/components/Footer";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, ErrorInfo, Component } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ProductProvider } from "@/contexts/ProductContext";
import { OrderProvider } from "@/contexts/OrderContext";

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    console.log("App mounted");
    try {
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-in-out',
      });
    } catch (error) {
      console.error("AOS initialization error:", error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <ErrorBoundary>
                  <ProductProvider>
                    <OrderProvider>
                      <Routes>
                        <Route path="/" element={
                          <>
                            <Index />
                            <Footer />
                          </>
                        } />
                        
                        {/* Protected Routes */}
                        <Route element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        } path="/orders" />
                        
                        {/* Public Admin Login */}
                        <Route path="/admin" element={<Admin />} />
                        
                        {/* Protected Admin Routes */}
                        <Route path="/admin" element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="dashboard/analytics" element={<AdminDashboard />} />
                          <Route path="products" element={<ManageProducts />} />
                          <Route path="reviews" element={<ManageReviews />} />
                        </Route>
                        
                        {/* 404 Page */}
                        <Route path="*" element={
                          <>
                            <NotFound />
                            <Footer />
                          </>
                        } />
                      </Routes>
                    </OrderProvider>
                  </ProductProvider>
                </ErrorBoundary>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
