import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Add error boundaries for better error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
} catch (error) {
  console.error('Failed to render the app:', error);
  document.body.innerHTML = `
    <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1>Something went wrong</h1>
      <p>We're having trouble loading the application. Please try refreshing the page.</p>
      <p>If the problem persists, please contact support.</p>
      <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
    </div>
  `;
}
