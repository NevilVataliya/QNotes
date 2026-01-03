import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    allowedHosts: ['qnotes-app.onrender.com']
  },
  define: {
    // Suppress React Router future flag warnings
    __REACT_ROUTER_FUTURE_FLAGS: JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }),
  },
})
