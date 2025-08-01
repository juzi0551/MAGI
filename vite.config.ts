import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false, // 生产环境关闭sourcemap以减小体积
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Render平台优化
  base: './', // 使用相对路径，适合静态部署
})