import { ref } from 'vue'
import { authModuleService } from '../services/AuthService'
import { navigateTo } from '#imports'
import { useSnackbar } from '@/composables/useSnackbar'

export const useForgotPasswordForm = () => {
  const email = ref('')
  const loading = ref(false)
  const error = ref('')
  const success = ref('')
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async () => {
    error.value = ''
    success.value = ''

    if (!email.value) {
      error.value = 'Ingresa el correo con el que te registraste.'

      return
    }

    loading.value = true

    const normalizedEmail = email.value.trim().toLowerCase()

    try {
      const result = await authModuleService.requestPasswordReset(normalizedEmail)

      if (!result.success) {
        error.value = result.message || 'No pudimos enviar el código. Intenta nuevamente.'
        showSnackbar({ text: error.value, color: 'error' })

        return
      }

      success.value = result.message || 'Te enviamos un código de recuperación a tu correo.'
      showSnackbar({ text: success.value, color: 'success' })

      await navigateTo({
        path: '/restablecer-contrasena',
        query: { email: normalizedEmail },
      })
    }
    finally {
      loading.value = false
    }
  }

  return {
    email,
    loading,
    error,
    success,
    handleSubmit,
  }
}
