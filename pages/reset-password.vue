<script setup lang="ts">
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2ResetPasswordIllustrationDark from '@images/pages/auth-v2-reset-password-illustration-dark.png'
import authV2ResetPasswordIllustrationLight from '@images/pages/auth-v2-reset-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useResetPasswordForm } from '@/src/features/auth'

definePageMeta({
  layout: 'blank',
  public: true,
  middleware: ['guest'],
})

const authThemeImg = useGenerateImageVariant(
  authV2ResetPasswordIllustrationLight,
  authV2ResetPasswordIllustrationDark,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const {
  otp,
  newPassword,
  confirmPassword,
  loading,
  resendLoading,
  resendCooldown,
  error,
  success,
  passwordFieldError,
  confirmFieldError,
  isEmailMissing,
  passwordChecks,
  handleResend,
  handleSubmit,
} = useResetPasswordForm()
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
        :max-width="520"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Restablece tu contraseña 🔐
          </h4>
          <p class="mb-2">
            Ingresa el código de 6 dígitos y define una nueva contraseña segura.
          </p>
          <p class="text-subtitle-2">
            La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial.
          </p>
        </VCardText>

        <VCardText>
          <VAlert
            v-if="isEmailMissing"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            No encontramos el correo para este proceso. Vuelve a la
            <NuxtLink class="text-primary" to="/forgot-password">
              pantalla de recuperación
            </NuxtLink>
            para solicitar un nuevo código.
          </VAlert>

          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <p class="text-subtitle-2 d-block mb-2">
                  Código de verificación
                </p>
                <VOtpInput
                  v-model="otp"
                  :disabled="loading || isEmailMissing"
                  type="number"
                  class="pa-0 mb-4"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="newPassword"
                  :disabled="isEmailMissing"
                  label="Nueva contraseña"
                  type="password"
                  autocomplete="new-password"
                  :error-messages="passwordFieldError ? [passwordFieldError] : []"
                />
              </VCol>

              <VCol cols="12">
                <div class="password-requirements">
                  <p class="text-subtitle-2 mb-2">
                    La contraseña debe incluir:
                  </p>
                  <ul class="password-requirements__list">
                    <li
                      v-for="check in passwordChecks"
                      :key="check.label"
                      :class="['password-requirements__item', { 'is-valid': check.isValid }]"
                    >
                      <VIcon
                        size="18"
                        :color="check.isValid ? 'success' : 'secondary'"
                        class="me-2"
                      >
                        {{ check.isValid ? 'tabler-check' : 'tabler-circle' }}
                      </VIcon>
                      <span>{{ check.label }}</span>
                    </li>
                  </ul>
                </div>
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="confirmPassword"
                  :disabled="isEmailMissing"
                  label="Confirmar contraseña"
                  type="password"
                  autocomplete="new-password"
                  :error-messages="confirmFieldError ? [confirmFieldError] : []"
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
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                  :disabled="isEmailMissing || loading"
                >
                  Actualizar contraseña
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center mt-4"
              >
                <VBtn
                  variant="text"
                  size="small"
                  :loading="resendLoading"
                  :disabled="resendLoading || resendCooldown > 0 || isEmailMissing"
                  @click="handleResend"
                >
                  <template v-if="resendCooldown > 0">
                    Reenviar en {{ resendCooldown }}s
                  </template>
                  <template v-else>
                    ¿No recibiste el código? Reenviar
                  </template>
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span>¿Listo para ingresar?</span>
                <NuxtLink
                  class="text-primary ms-1"
                  to="/login"
                >
                  Volver a iniciar sesión
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

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}

.password-requirements {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 8px;
  padding: 12px 16px;
  background-color: rgba(var(--v-theme-on-surface), 0.02);

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    row-gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: rgba(var(--v-theme-on-surface), 0.7);

    &.is-valid {
      color: rgb(var(--v-theme-success));
      font-weight: 600;
    }
  }
}
</style>
