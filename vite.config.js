import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'brocken.png'],
      manifest: {
        name: 'Heksejakt 2026',
        short_name: 'Heksejakt',
        description: 'Reiseguide for #nød 2026 – Hamburg & Goslar',
        theme_color: '#f97316',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 3600 } }
          },
          {
            urlPattern: /^https:\/\/api\.exchangerate-api\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'currency-cache', expiration: { maxAgeSeconds: 3600 } }
          }
        ]
      }
    })
  ],
})
