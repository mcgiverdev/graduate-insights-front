<script setup lang="ts">
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useForgotPasswordForm } from '@/src/features/auth'

definePageMeta({
  layout: 'blank',
  public: true,
  middleware: ['guest'],
})

const authThemeImg = useGenerateImageVariant(
  authV2ForgotPasswordIllustrationLight,
  authV2ForgotPasswordIllustrationDark,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const {
  email,
  loading,
  error,
  success,
  handleSubmit,
} = useForgotPasswordForm()
</script>

<template>
  <NuxtLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3 mb-6">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </NuxtLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="7"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="520"
            :src="authThemeImg"
            class="auth-illustration mt-16"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="5"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="480"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            ¿Olvidaste tu contraseña? 🔐
          </h4>
          <p class="mb-0">
            Ingresa tu correo y te enviaremos un código de verificación para crear una nueva contraseña.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VAlert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ error }}
                </VAlert>

                <VAlert
                  v-if="success"
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ success }}
                </VAlert>

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Enviarme el código
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-body-1 text-center mt-4"
              >
                <span>¿Recordaste tu contraseña?</span>
                <NuxtLink
                  class="text-primary ms-1"
                  to="/login"
                >
                  Volver al inicio de sesión
                </NuxtLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
