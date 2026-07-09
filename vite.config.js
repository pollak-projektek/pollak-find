import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'Logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'PollakFind Teremkereső',
        short_name: 'PollakFind',
        description: 'Belső útvonaltervező és teremkereső a Pollák Antal Technikumba.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'Logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
