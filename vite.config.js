import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2020'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://node-nepal.freeschema.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})