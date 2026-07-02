// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: 'src/',
  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

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
    langDir: '../src/locales',
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
    '~/app/styles/main.css'
  ],

  typescript: {
    strict: true,
    typeCheck: false
  }
})
