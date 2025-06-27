import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Admin email that's allowed to access
const ADMIN_EMAIL = 'shreemahalaxmi.product@gmail.com';

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error('Unauthorized access. Only admin can sign in.');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out function
const signOutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Check if current user is admin
const isAdmin = (user) => {
  return user && user.email === ADMIN_EMAIL;
};

// Auth state observer
const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      callback(user);
    } else if (user) {
      // Sign out if not admin
      signOut(auth);
      callback(null);
    } else {
      callback(null);
    }
  });
};

export { 
  auth, 
  signInWithGoogle, 
  signOutAdmin as signOut, 
  isAdmin, 
  onAuthStateChangedListener 
};
