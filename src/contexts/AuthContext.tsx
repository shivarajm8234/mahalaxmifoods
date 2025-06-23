import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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
    signOutUser,
  }), [currentUser, loading, signOutUser]);

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
