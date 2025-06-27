import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { 
  User, 
  signOut as firebaseSignOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const ADMIN_EMAIL = 'shreemahalaxmi.product@gmail.com';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
      if (user && user.email !== ADMIN_EMAIL) {
        // If user is not admin, sign them out
        firebaseSignOut(auth);
        setCurrentUser(null);
        setIsAdmin(false);
      } else {
        setCurrentUser(user);
        checkAdmin(user);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [checkAdmin]);

  const signInAdmin = useCallback(async (email: string, password: string) => {
    if (email !== ADMIN_EMAIL) {
      throw new Error('Unauthorized access. Only admin can sign in.');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await firebaseSignOut(auth);
        throw new Error('Unauthorized access. Only admin can sign in.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      
      if (user.email !== ADMIN_EMAIL) {
        await firebaseSignOut(auth);
        throw new Error('Unauthorized access. Only admin can sign in.');
      }
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
    signInAdmin,
    signInWithGoogle,
    signOutUser,
  }), [currentUser, loading, isAdmin, signInAdmin, signInWithGoogle, signOutUser]);

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
