import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-ignore - lovable-tagger might not have types
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    define: {
      // Expose environment variables to the client
      'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(env.VITE_RAZORPAY_KEY_ID),
      'import.meta.env.VITE_RAZORPAY_KEY_SECRET': JSON.stringify(env.VITE_RAZORPAY_KEY_SECRET),
    },
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
