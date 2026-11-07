import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'IronForge: Умная Прогрессия',
        short_name: 'IronForge',
        description: 'PWA-трекер тренировок с умной двойной прогрессией нагрузок',
        theme_color: '#0a0a0c',
        background_color: '#0a0a0c',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/media/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ironforge-exercise-media',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 140, maxAgeSeconds: 60 * 60 * 24 * 180 }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname === 'media1.tenor.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'ironforge-exercise-media',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 140, maxAgeSeconds: 60 * 60 * 24 * 180 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ironforge-font-styles',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 180 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ironforge-font-files',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 180 }
            }
          }
        ]
      }
    })
  ]
});
