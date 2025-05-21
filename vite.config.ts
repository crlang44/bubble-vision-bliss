import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Enable minification
    minify: 'terser',
    // Enable source maps in development
    sourcemap: mode === 'development',
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup options
    rollupOptions: {
      output: {
        // Split chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Add other large dependencies here
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
