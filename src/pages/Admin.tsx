import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic client-side validation
      if (!username.trim() || !password) {
        throw new Error("Please enter both username and password");
      }

      // Call the login function from AuthContext
      await login(username, password);
      
      // Show success message
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard!",
      });
      
      // Redirect to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to log in");
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl animate-fade-in-up">
        <form onSubmit={handleLogin}>
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <UserCircle className="h-16 w-16 text-indigo-500 dark:text-indigo-300 mb-2 drop-shadow-lg" />
            <CardTitle className="text-3xl font-extrabold text-black dark:text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-2">
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/80 dark:bg-gray-800"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 dark:bg-gray-800"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </CardContent>
        </form>
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