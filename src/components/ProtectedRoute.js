import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChangedListener, isAdmin } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      if (!user || !isAdmin(user)) {
        // Redirect to login if not authenticated or not admin
        navigate('/login', { state: { from: location }, replace: true });
      } else {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return children;
};

export default ProtectedRoute;
