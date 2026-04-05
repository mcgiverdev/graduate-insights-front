import { reactive } from 'vue'
import { authModuleService } from '../services/AuthService'
import { useSnackbar } from '@/composables/useSnackbar'

const RESEND_INTERVAL = 60

export const useVerificationForm = () => {
  const state = reactive({
    otp: '',
    email: '',
    loading: false,
    resendLoading: false,
    resendCooldown: 0,
    isOtpInserted: false,
    message: '',
    error: '',
  })

  const { showSnackbar } = useSnackbar()
  let interval: ReturnType<typeof setInterval> | null = null

  const setEmail = (email: string) => {
    state.email = email
  }

  const startCooldown = () => {
    state.resendCooldown = RESEND_INTERVAL
    interval && clearInterval(interval)
    interval = setInterval(() => {
      state.resendCooldown--
      if (state.resendCooldown <= 0 && interval) {
        clearInterval(interval)
        interval = null
      }
    }, 1000)
  }

  const submit = async () => {
    if (!state.email) {
      state.error = 'No se proporcionó un correo electrónico'

      return { success: false }
    }

    state.loading = true
    try {
      const result = await authModuleService.verifyCode({ email: state.email, code: state.otp })
      if (!result.success) {
        state.error = result.message || 'El código ingresado no es válido'

        return result
      }

      state.isOtpInserted = true
      state.error = ''
      showSnackbar({ text: 'Código verificado', color: 'success' })

      setTimeout(() => {
        state.isOtpInserted = false
      }, 2000)

      return result
    }
    finally {
      state.loading = false
    }
  }

  const resend = async () => {
    if (!state.email) {
      state.error = 'No se proporcionó un correo electrónico'

      return { success: false }
    }

    if (state.resendCooldown > 0)
      return { success: false }

    state.resendLoading = true
    try {
      const result = await authModuleService.resendCode(state.email)
      if (result.success) {
        state.message = result.message || ''
        state.error = ''
        state.otp = ''
        startCooldown()
      }
      else {
        state.error = result.message || 'Error al reenviar el código. Intenta nuevamente.'
      }

      return result
    }
    finally {
      state.resendLoading = false
    }
  }

  const cleanup = () => {
    if (interval)
      clearInterval(interval)
  }

  return {
    state,
    setEmail,
    submit,
    resend,
    cleanup,
  }
}
