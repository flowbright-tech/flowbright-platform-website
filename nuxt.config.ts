// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  
  future: {
    compatibilityVersion: 4
  },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    manifest: {
      name: 'Flow Bright SRP',
      short_name: 'FlowBright',
      description: 'SME Resource Planning Platform',
      theme_color: '#4f46e5',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  i18n: {
    locales: [
      {
        code: 'th',
        language: 'th-TH',
        name: 'ไทย',
        file: 'th.json'
      },
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    defaultLocale: 'th',
    strategy: 'prefix_except_default',
    langDir: '../app/locales',
    lazy: false,
    detectBrowserLanguage: false
  },

  app: {
    head: {
      title: 'Flow Bright SRP - SME Resource Planning',
      meta: [
        { name: 'description', content: 'High-performance, multi-tenant SME Resource Planning (SRP) platform built with Nuxt, Nuxt UI, and static-first architecture.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },

  css: [
    '~/assets/styles/main.css'
  ],

  runtimeConfig: {
    public: {
      apiDomain: process.env.NUXT_PUBLIC_API_DOMAIN || 'https://flowbright-platform-api.onrender.com'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
