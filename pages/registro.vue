<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRegisterForm } from '@/src/features/auth'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
  middleware: ['guest'],
})

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const {
  form,
  errors,
  loading,
  isPasswordVisible,
  validateField,
  handleSubmit,
} = useRegisterForm()

const onSubmit = async () => {
  const result = await handleSubmit()

  if (result.success) {
    await navigateTo({
      path: '/validar-codigo',
      query: { email: form.correo.trim().toLowerCase() },
    })
  }
}
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
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
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
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="520"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Crea tu cuenta de egresado ✨
          </h4>
          <p class="mb-0">
            Regístrate con tus datos personales para iniciar el proceso de validación.
          </p>
        </VCardText>

        <VCardText>
          <VAlert
            type="info"
            variant="tonal"
            class="mb-6"
          >
            Tras el registro te enviaremos un código de verificación por correo y un director deberá aprobar tu acceso antes de que puedas ingresar al sistema.
          </VAlert>

          <VForm @submit.prevent="onSubmit">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.nombres"
                  label="Nombres"
                  placeholder="Juan Carlos"
                  :error="Boolean(errors.nombres)"
                  :error-messages="errors.nombres ? [errors.nombres] : []"
                  @blur="() => validateField('nombres')"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.apellidos"
                  label="Apellidos"
                  placeholder="Pérez López"
                  :error="Boolean(errors.apellidos)"
                  :error-messages="errors.apellidos ? [errors.apellidos] : []"
                  @blur="() => validateField('apellidos')"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.dni"
                  label="DNI"
                  placeholder="12345678"
                  maxlength="8"
                  :error="Boolean(errors.dni)"
                  :error-messages="errors.dni ? [errors.dni] : []"
                  @blur="() => validateField('dni')"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.celular"
                  label="Celular"
                  placeholder="987654321"
                  maxlength="9"
                  :error="Boolean(errors.celular)"
                  :error-messages="errors.celular ? [errors.celular] : []"
                  @blur="() => validateField('celular')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.correo"
                  label="Correo institucional"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  :error="Boolean(errors.correo)"
                  :error-messages="errors.correo ? [errors.correo] : []"
                  @blur="() => validateField('correo')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.contrasena"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :error="Boolean(errors.contrasena)"
                  :error-messages="errors.contrasena ? [errors.contrasena] : []"
                  autocomplete="new-password"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  @blur="() => validateField('contrasena')"
                />
                <p class="text-caption text-medium-emphasis mt-2 mb-0">
                  Usa al menos 6 caracteres combinando letras y números.
                </p>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Registrarme
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-body-1 text-center mt-4"
              >
                <span>¿Ya tienes una cuenta?</span>
                <NuxtLink
                  class="text-primary ms-1"
                  to="/login"
                >
                  Inicia sesión
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
