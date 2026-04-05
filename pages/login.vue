<script setup lang="ts">
import { LoginForm } from '@/src/features/auth'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
  middleware: ['guest'],
})
</script>

<template>
  <VThemeProvider theme="light">
    <div class="auth-wrapper d-flex align-center justify-center pa-4">
      <div class="position-relative my-sm-16">
        <!-- Top shape -->
        <VNodeRenderer
          :nodes="h('div', { innerHTML: authV1TopShape })"
          class="text-primary auth-v1-top-shape d-none d-sm-block"
        />

        <!-- Bottom shape -->
        <VNodeRenderer
          :nodes="h('div', { innerHTML: authV1BottomShape })"
          class="text-primary auth-v1-bottom-shape d-none d-sm-block"
        />

        <!-- Auth Card -->
        <VCard
          class="auth-card"
          max-width="460"
          :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
        >
          <VCardItem class="justify-center pb-2">
            <VCardTitle>
              <NuxtLink
                to="/"
                class="d-flex flex-column align-center text-decoration-none"
              >
                <div class="auth-logo-img mb-3">
                  <VNodeRenderer :nodes="themeConfig.app.logo" />
                </div>
                <span class="auth-brand-title text-primary">
                  Egresys
                </span>
              </NuxtLink>
            </VCardTitle>
          </VCardItem>

          <VDivider class="mx-6 mb-2" />

          <VCardText class="pt-4">
            <h4 class="text-h5 font-weight-bold mb-1 text-center">
              Bienvenido de nuevo
            </h4>
            <p class="mb-0 text-center text-medium-emphasis">
              Inicia sesión para acceder al sistema
            </p>
          </VCardText>

          <VCardText>
            <LoginForm @success="() => navigateTo('/', { replace: true })" />
          </VCardText>
        </VCard>
      </div>
    </div>
  </VThemeProvider>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.auth-brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.auth-logo-img img {
  height: 72px !important;
  width: auto !important;
  display: block !important;
  margin: 0 auto !important;
}
</style>
