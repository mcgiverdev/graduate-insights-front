import { computed, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useSnackbar } from '@/composables/useSnackbar'
import { authModuleService } from '../services/AuthService'

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=\S+$).{8,}$/

export const useResetPasswordForm = () => {
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
        navigateTo('/iniciar-sesion', { replace: true })
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

  return {
    email,
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
  }
}
