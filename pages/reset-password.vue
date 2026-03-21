<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2ResetPasswordIllustrationDark from '@images/pages/auth-v2-reset-password-illustration-dark.png'
import authV2ResetPasswordIllustrationLight from '@images/pages/auth-v2-reset-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { authModuleService } from '@/modules/auth/services/AuthService'
import { useSnackbar } from '@/composables/useSnackbar'

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
const route = useRoute()
const email = ref(route.query.email?.toString() || '')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const resendCooldown = ref(0)
const error = ref('')
const success = ref('')
const passwordFieldError = ref('')
const confirmFieldError = ref('')
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=\S+$).{8,}$/
const { showSnackbar } = useSnackbar()
let interval: ReturnType<typeof setInterval> | null = null

watch(
  () => route.query.email,
  value => {
    email.value = value?.toString() || ''
  },
)

const isEmailMissing = computed(() => !email.value)
const passwordChecks = computed(() => [
  {
    label: 'Al menos 8 caracteres',
    isValid: newPassword.value.length >= 8,
  },
  {
    label: 'Una letra mayúscula',
    isValid: /[A-Z]/.test(newPassword.value),
  },
  {
    label: 'Una letra minúscula',
    isValid: /[a-z]/.test(newPassword.value),
  },
  {
    label: 'Un número',
    isValid: /\d/.test(newPassword.value),
  },
  {
    label: 'Un carácter especial (!@#$…)',
    isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword.value),
  },
  {
    label: 'Sin espacios',
    isValid: newPassword.value.length > 0 ? /^\S+$/.test(newPassword.value) : false,
  },
])
const isPasswordStrong = computed(() => PASSWORD_REGEX.test(newPassword.value))

watch(newPassword, () => {
  passwordFieldError.value = ''
  error.value = ''
})

watch(confirmPassword, () => {
  confirmFieldError.value = ''
  error.value = ''
})

const startCooldown = () => {
  resendCooldown.value = 60

  if (interval)
    clearInterval(interval)

  interval = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0 && interval) {
      clearInterval(interval)
      interval = null
    }
  }, 1000)
}

const handleResend = async () => {
  error.value = ''
  success.value = ''
  passwordFieldError.value = ''
  confirmFieldError.value = ''

  if (isEmailMissing.value) {
    error.value = 'No tenemos el correo asociado a la recuperación.'
    return
  }

  if (resendCooldown.value > 0)
    return

  resendLoading.value = true
  try {
    const normalizedEmail = email.value.trim().toLowerCase()
    email.value = normalizedEmail
    const result = await authModuleService.requestPasswordReset(normalizedEmail)
    if (!result.success) {
      error.value = result.message || 'No pudimos reenviar el código. Intenta más tarde.'
      showSnackbar({ text: error.value, color: 'error' })
      return
    }

    success.value = result.message || 'Código reenviado. Revisa tu correo.'
    showSnackbar({ text: success.value, color: 'success' })
    otp.value = ''
    startCooldown()
  }
  finally {
    resendLoading.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (isEmailMissing.value) {
    error.value = 'Debes iniciar el proceso desde "Olvidé mi contraseña".'
    return
  }

  if (otp.value.length !== 6) {
    error.value = 'Ingresa el código de 6 dígitos que enviamos a tu correo.'
    return
  }

  if (!newPassword.value) {
    passwordFieldError.value = 'Ingresa tu nueva contraseña.'
    return
  }

  if (!isPasswordStrong.value) {
    passwordFieldError.value = 'La contraseña debe cumplir todos los requisitos indicados.'
    return
  }

  if (!confirmPassword.value) {
    confirmFieldError.value = 'Confirma tu nueva contraseña.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmFieldError.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  try {
    const normalizedEmail = email.value.trim().toLowerCase()
    email.value = normalizedEmail

    const payload = {
      email: normalizedEmail,
      code: otp.value,
      newPassword: newPassword.value,
    }

    const result = await authModuleService.resetPassword(payload)

    if (!result.success) {
      if (result.fieldErrors?.newPassword)
        passwordFieldError.value = result.fieldErrors.newPassword

      error.value = result.message || 'No pudimos actualizar tu contraseña.'
      showSnackbar({ text: error.value, color: 'error' })
      return
    }

    success.value = result.message || 'Contraseña actualizada correctamente.'
    showSnackbar({ text: success.value, color: 'success' })

    setTimeout(() => {
      navigateTo('/login', { replace: true })
    }, 1000)
  }
  finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (interval)
    clearInterval(interval)
})
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
                <label class="text-subtitle-2 d-block mb-2">Código de verificación</label>
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
