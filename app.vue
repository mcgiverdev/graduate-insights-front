<script setup lang="ts">
import { useTheme } from 'vuetify'
import AppSnackbar from '@/components/common/AppSnackbar.vue'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
const { isMobile } = useDevice()
if (isMobile)
  configStore.appContentLayoutNav = 'vertical'

// Middleware global
definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <AppSnackbar />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
