import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully.',
        });
        navigate('/');
      } else {
        await signIn(email, password);
        toast({
          title: 'Logged in!',
          description: 'You have been logged in successfully.',
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to authenticate',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground">
          {isSignUp ? 'Enter your details to create an account' : 'Enter your email and password to sign in'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSignUp ? 'Creating account...' : 'Signing in...'}
            </span>
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        {isSignUp ? (
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(false)}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(true)}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
