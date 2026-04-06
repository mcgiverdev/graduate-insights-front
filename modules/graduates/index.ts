import { defineNuxtModule } from '@nuxt/kit'

// No-op local Nuxt module to avoid collisions with business modules under modules/.
export default defineNuxtModule({
  meta: {
    name: 'graduate-insights-graduates-local-module',
  },
  setup() {},
})
