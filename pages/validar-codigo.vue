<script setup lang="ts">
import { VerificationForm } from '@/src/features/auth'
import { computed, h } from 'vue'
import { navigateTo, useRoute } from '#imports'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
})

const route = useRoute()
const email = computed(() => route.query.email?.toString() || '')

const handleVerified = () => navigateTo('/', { replace: true })

const goToLogin = () => {
  const token = useCookie('accessToken', { path: '/' })
  token.value = null
  navigateTo('/login', { replace: true })
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <NuxtLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </NuxtLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Verificación de Cuenta 💬
          </h4>
          <p class="mb-1">
            Hemos enviado un código de verificación a tu correo electrónico. Ingresa el código para validar tu cuenta.
          </p>
          <h6 class="text-h6">
            {{ email || 'Correo no especificado' }}
          </h6>
        </VCardText>

        <VCardText>
          <VerificationForm @verified="handleVerified" />

          <div class="text-center mt-4">
            <a
              class="text-primary text-body-2 cursor-pointer"
              @click="goToLogin"
            >
              ← Volver al inicio de sesión
            </a>
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
