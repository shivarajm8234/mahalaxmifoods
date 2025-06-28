import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { FcGoogle } from "react-icons/fc";

const ADMIN_EMAIL = 'shreemahalaxmi.product@gmail.com';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin, loading: authLoading, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect location or default to dashboard
  const from = location.state?.from?.pathname || "/admin/dashboard";

  // Redirect if already logged in as admin
  useEffect(() => {
    if (currentUser && isAdmin) {
      // Only navigate if we're not already on the target page and not already on the admin page
      if (location.pathname === '/admin' || location.pathname === '/admin/') {
        navigate(from, { replace: true });
      }
    }
  }, [currentUser, isAdmin, navigate, from, location.pathname]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // If already logged in but not an admin, show access denied
  if (currentUser && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      
      // Show success message
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard!",
      });
      
      // Redirect to the intended page or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl animate-fade-in-up">
        <div>
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <UserCircle className="h-16 w-16 text-indigo-500 dark:text-indigo-300 mb-2 drop-shadow-lg" />
            <CardTitle className="text-3xl font-extrabold text-black dark:text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
              Only authorized administrators can access this panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-2">
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-6 border-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <FcGoogle className="h-5 w-5" />
                      <span>Sign in with Google</span>
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Only authorized administrators can access this panel
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
      `}</style>
    </div>
  );
};

export default Admin; 