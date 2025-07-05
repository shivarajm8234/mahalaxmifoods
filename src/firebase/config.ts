import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged as onAuthStateChangedFirebase,
  User,
  UserCredential,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  enableIndexedDbPersistence,
  Firestore,
  FirestoreErrorCode,
  initializeFirestore,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  SetOptions,
  UpdateData,
  WithFieldValue
} from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Types
type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  analytics?: Analytics;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU-evRD3Imtb-zJhOst7WJH1HN6ty16wo",
  authDomain: "shree-mahalaxmi-foods-products.firebaseapp.com",
  projectId: "shree-mahalaxmi-foods-products",
  storageBucket: "shree-mahalaxmi-foods-products.appspot.com",
  messagingSenderId: "592899536490",
  appId: "1:592899536490:web:45f248dcb4d8844d447c13",
  measurementId: "G-NB3PRXHS1G"
};

// Initialize Firebase services with proper error handling
const initializeFirebase = (): FirebaseServices => {
  try {
    // Initialize Firebase app
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Auth
    const auth = getAuth(app);
    
    // Initialize Firestore with optimized settings
    const db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: false
    });

    // Enable persistence with error handling
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db, { forceOwnership: true })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence.');
          }
        });
    }
    
    // Helper function to handle Firestore errors
    const handleFirestoreError = (operation: string, error: any) => {
      console.error(`Firestore ${operation} error:`, error);
      throw error; // Re-throw to allow caller to handle the error
    };

    // Initialize Analytics if in browser environment
    let analytics: Analytics | undefined;
    if (typeof window !== 'undefined') {
      isSupported().then(yes => {
        if (yes) {
          analytics = getAnalytics(app);
        }
      }).catch(error => {
        console.warn('Failed to initialize Analytics:', error);
      });
    }

    // Enable persistence in production or if explicitly enabled in development
    // Note: With the new cache API, offline persistence is enabled by default
    // We'll just log if we're in a multi-tab scenario
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Multi-tab persistence is now the default behavior
      // No need to explicitly enable it
    }

    return { app, auth, db, analytics };
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    throw error;
  }
};

// Initialize Firebase services
const { app, auth, db, analytics } = initializeFirebase();

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

// Set up global error handler for uncaught Firestore errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error?.code?.startsWith?.('firebase') || error?.code?.startsWith?.('permission-denied')) {
      console.error('Unhandled Firestore error:', error);
    }
  });
}

// Helper function to enable offline persistence with error handling
const enableIndexedDbPromise = async (db: Firestore) => {
  try {
    await enableIndexedDbPersistence(db, { forceOwnership: true });
    console.log('Firestore offline persistence enabled');
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Offline persistence can only be enabled in one tab at a time.');
    } else if (error.code === 'unimplemented') {
      console.warn('This browser does not support offline persistence.');
    } else {
      console.error('Error enabling offline persistence:', error);
    }
  }
};

// No need to explicitly enable persistence as it's handled by the cache configuration
// This prevents the multiple tabs warning

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Check if user exists in Firestore, create if not
const checkAndCreateUser = async (user: User) => {
  if (!user?.uid) {
    console.error('Invalid user object');
    return null;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orders: [],
        cart: []
      };
      
      await setDoc(userRef, userData, { merge: true });
      return userData;
    }
    return userDoc.data();
  } catch (error: any) {
    console.error('Error in checkAndCreateUser:', error);
    if (error.code === 'unavailable') {
      // Handle offline mode
      console.warn('Firestore is unavailable. Working in offline mode.');
      return null;
    }
    console.error('Error in checkAndCreateUser:', error);
    return null;
  }
};

// Sign in with Google
const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check and create user in Firestore (don't await to prevent blocking)
    checkAndCreateUser(result.user).catch(console.error);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Track order
const trackOrder = async (userId: string, orderData: any) => {
  try {
    // Create order document
    const orderRef = doc(collection(db, 'orders'));
    await setDoc(orderRef, {
      ...orderData,
      userId,
      status: 'pending',
      orderDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update user's orders array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      orders: arrayUnion(orderRef.id)
    });

    return orderRef.id;
  } catch (error) {
    console.error('Error tracking order:', error);
    throw error;
  }
};

// Get user data
const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Export all Firebase services and utilities in a single export statement
export {
  // Core Firebase services
  auth,
  db,
  storage,
  onAuthStateChangedFirebase as onAuthStateChanged,
  type User,
  
  // Firestore functions
  getDoc,
  setDoc,
  updateDoc,
  
  // Firestore utilities
  collection,
  doc,
  arrayUnion,
  serverTimestamp,
  enableIndexedDbPersistence,
  
  // Auth and data functions
  signInWithGoogle,
  signOutUser,
  checkAndCreateUser,
  getUserData,
  trackOrder
};
