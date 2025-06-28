import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { 
  User, 
  signOut as firebaseSignOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const ADMIN_EMAIL = 'shreemahalaxmi.product@gmail.com';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signInWithGoogle: () => Promise<User | void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the current user is the admin
  const checkAdmin = useCallback((user: FirebaseUser | null) => {
    const isUserAdmin = !!user && user.email === ADMIN_EMAIL;
    setIsAdmin(isUserAdmin);
    return isUserAdmin;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email === ADMIN_EMAIL) {
        // Only allow the admin email to stay logged in
        setCurrentUser(user);
        checkAdmin(user);
      } else if (user) {
        // For non-admin users, sign them out if they try to access admin routes
        const isOnAdminRoute = window.location.pathname.startsWith('/admin');
        if (isOnAdminRoute) {
          firebaseSignOut(auth);
          setCurrentUser(null);
          setIsAdmin(false);
        } else {
          setCurrentUser(user);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [checkAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update user profile with display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName
        });
      }
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // If the signed-in user is the admin, allow access
      if (result.user.email === ADMIN_EMAIL) {
        return result.user;
      }
      
      // For non-admin users, sign them out and show an error
      await firebaseSignOut(auth);
      throw new Error('Only admin can sign in with Google');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // Additional cleanup can be done here if needed
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signOutUser,
  }), [currentUser, loading, isAdmin, signIn, signUp, signInWithGoogle, signOutUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
