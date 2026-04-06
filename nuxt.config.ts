import { fileURLToPath } from 'node:url'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable SPA mode for static deployment with nginx
  ssr: false,
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },

  // Configuración del servidor de desarrollo
  devServer: {
    port: 3000,
    host: '0.0.0.0', // Permite conexiones desde cualquier IP
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    },
  },
  app: {
    head: {
      titleTemplate: '%s - Sistema de Egresados',
      title: 'Sistema de Egresados',

      link: [{
        rel: 'icon',
        type: 'image/png',
        href: '/logo.png',
      }],
    },

    // Configuración para SPA con proxy reverso
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: '/_nuxt/',
  },

  devtools: {
    enabled: false,
  },

  css: [
    '@core/scss/template/index.scss',
    '@styles/styles.scss',
    '@/plugins/iconify/icons.css',
    'vuetify/lib/styles/main.sass',
  ],

  components: {
    dirs: [{
      path: '@/@core/components',
      pathPrefix: false,
    }, {
      path: '~/components/global',
      global: true,
    }, {
      path: '~/components',
      pathPrefix: false,
    }],
  },

  plugins: [
    '@/plugins/vuetify/index.ts',
    '@/plugins/iconify/index.ts',
  ],

  imports: {
    dirs: ['./@core/utils', './@core/composable/', './plugins/*/composables/*'],
  },

  hooks: {},

  experimental: {
    typedPages: true,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@/*': ['../*'],
          '@themeConfig': ['../themeConfig.ts'],
          '@layouts/*': ['../@layouts/*'],
          '@layouts': ['../@layouts'],
          '@core/*': ['../@core/*'],
          '@core': ['../@core'],
          '@images/*': ['../assets/images/*'],
          '@styles/*': ['../assets/styles/*'],
          '@validators': ['../@core/utils/validators'],
          '@db/*': ['../server/fake-db/*'],
          '@api-utils/*': ['../server/utils/*'],
          '@/composables/*': ['../composables/*'],
        },
      },
    },
  },

  // ℹ️ Disable source maps until this is resolved: https://github.com/vuetifyjs/vuetify-loader/issues/290
  sourcemap: {
    server: false,
    client: false,
  },

  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
    },
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: [
        'panel.unu.test',
        'localhost',
        '127.0.0.1',
        '.unu.test', // Permite cualquier subdominio de unu.test
      ],
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
        '@core': fileURLToPath(new URL('./@core', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./@layouts', import.meta.url)),
        '@images': fileURLToPath(new URL('./assets/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./assets/styles/', import.meta.url)),
        '@configured-variables': fileURLToPath(new URL('./assets/styles/variables/_template.scss', import.meta.url)),
        '@db': fileURLToPath(new URL('./server/fake-db/', import.meta.url)),
        '@api-utils': fileURLToPath(new URL('./server/utils/', import.meta.url)),
        '@/composables': fileURLToPath(new URL('./composables', import.meta.url)),
      },
    },

    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts'))
              return 'vendor-apexcharts'
            if (id.includes('chart.js') || id.includes('vue-chartjs'))
              return 'vendor-chartjs'
            if (id.includes('mapbox-gl'))
              return 'vendor-mapbox'
            if (id.includes('@tiptap'))
              return 'vendor-tiptap'
            if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/'))
              return 'vendor-vue'
            if (id.includes('node_modules/pinia'))
              return 'vendor-pinia'
            if (id.includes('node_modules/@vueuse/'))
              return 'vendor-vueuse'
            if (id.includes('node_modules/vee-validate') || id.includes('node_modules/zod'))
              return 'vendor-validation'
            if (id.includes('node_modules/flatpickr') || id.includes('vue-flatpickr'))
              return 'vendor-flatpickr'
            if (id.includes('node_modules/@iconify/'))
              return 'vendor-iconify'
          },
        },
      },
    },

    optimizeDeps: {
      exclude: ['vuetify'],
    },

    plugins: [
      svgLoader(),
      vuetify({
        autoImport: true,
        styles: {
          configFile: 'assets/styles/variables/_vuetify.scss',
        },
      }),
    ],

    ssr: {
      noExternal: ['vuetify'],
    },
  },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@pinia/nuxt',
  ],

  // Avoid treating the business `modules/` directory as Nuxt local modules.
  modulesDir: ['node_modules'],

  // Remover middleware global para SPA mode
  // router: {
  //   middleware: ['auth'],
  // },
})
