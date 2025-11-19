import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
  base: '/',
  root: '.',  // Explicitly set root directory
  publicDir: 'public',  // Directory for static assets
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    strictPort: true,  // Exit if port is in use
    // Add this for HMR to work with ngrok
    hmr: {
      clientPort: 443, // ngrok uses 443 for https
    },
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'localhost:3000' ],
  },
  build: {
    outDir: 'dist',  // Changed from 'build' to 'dist' (Vite default)
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')  // Optional: for @/ imports
    }
  },
  define: {
    'process.env.VITE_ACCESS_CODE': JSON.stringify(env.VITE_ACCESS_CODE),
    'process.env.VITE_ALLOWED_IP': JSON.stringify(env.VITE_ALLOWED_IP),
    'process.env.VITE_NANIT_EMAIL': JSON.stringify(env.VITE_NANIT_EMAIL),
    'process.env.VITE_NANIT_PASSWORD': JSON.stringify(env.VITE_NANIT_PASSWORD),
    'process.env.VITE_BABY_ID': JSON.stringify(env.VITE_BABY_ID),
    'process.env.VITE_PHONE_SUFFIX': JSON.stringify(env.VITE_PHONE_SUFFIX),
  }
}
}); 