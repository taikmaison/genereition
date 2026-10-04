import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      workbox: {
        // Fonts are needed to build the PDF, so they are cached for offline use too.
        globPatterns: ['**/*.{js,css,html,png,ttf,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Генератор Договоров SENIMDI',
        short_name: 'SENIMDI',
        description: 'PWA для генерации договоров',
        lang: 'ru',
        theme_color: '#ffffff',
        background_color: '#f9fafb',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    // pdfmake (~1 MB) is a lazily loaded chunk, fetched only when a PDF is generated.
    chunkSizeWarningLimit: 1100,
  },
  server: {
    allowedHosts: true
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  }
})
