import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8081,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:5001/api'),
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5001/api')
  }
})
