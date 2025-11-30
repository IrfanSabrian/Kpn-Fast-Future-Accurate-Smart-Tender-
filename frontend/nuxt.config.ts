// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-23',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'KPN FAST',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      gdriveViewerUrl: process.env.NUXT_PUBLIC_GDRIVE_VIEWER_URL || 'https://drive.google.com/file/d/'
    }
  },

  app: {
    head: {
      title: 'KPN FAST - Fast And Smart Technology',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Sistem Automasi Dokumen Pengadaan dengan AI - KPN FAST (Fast And Smart Technology)' 
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' 
        }
      ]
    }
  },

  devServer: {
    port: 3000,
    host: '0.0.0.0'
  }
})
