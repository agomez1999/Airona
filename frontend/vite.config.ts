import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Proxy API requests to the Laravel backend (Docker Nginx on port 80)
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    sourcemap: false,
    rollupOptions: {
      input: isSsrBuild ? 'src/entry-server.tsx' : 'index.html',
      output: isSsrBuild ? {} : {
        manualChunks: (id) => {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/')) return 'vendor-forms'
        },
      },
    },
  },
}))
