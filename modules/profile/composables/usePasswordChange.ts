import { reactive, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { profileService } from '../services/ProfileService'

interface PasswordForm {
  newPassword: string
  confirmPassword: string
}

const createInitialForm = (): PasswordForm => ({
  newPassword: '',
  confirmPassword: '',
})

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  digit: /[0-9]/,
  lower: /[a-z]/,
  upper: /[A-Z]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
}

export const usePasswordChange = () => {
  const form = reactive<PasswordForm>(createInitialForm())
  const errors = ref<Record<keyof PasswordForm, string | undefined>>({
    newPassword: undefined,
    confirmPassword: undefined,
  })
  const submitting = ref(false)
  const { showSnackbar } = useSnackbar()

  const reset = () => {
    const initialValues = createInitialForm()
    form.newPassword = initialValues.newPassword
    form.confirmPassword = initialValues.confirmPassword
    errors.value = { newPassword: undefined, confirmPassword: undefined }
  }

  const validate = () => {
    errors.value = { newPassword: undefined, confirmPassword: undefined }

    if (!form.newPassword)
      errors.value.newPassword = 'La nueva contraseña es obligatoria'
    else if (form.newPassword.length < PASSWORD_REQUIREMENTS.minLength)
      errors.value.newPassword = 'Debe tener al menos 8 caracteres'
    else if (!PASSWORD_REQUIREMENTS.digit.test(form.newPassword))
      errors.value.newPassword = 'Debe incluir al menos un dígito'
    else if (!PASSWORD_REQUIREMENTS.lower.test(form.newPassword))
      errors.value.newPassword = 'Debe incluir al menos una letra minúscula'
    else if (!PASSWORD_REQUIREMENTS.upper.test(form.newPassword))
      errors.value.newPassword = 'Debe incluir al menos una letra mayúscula'
    else if (!PASSWORD_REQUIREMENTS.special.test(form.newPassword))
      errors.value.newPassword = 'Debe incluir al menos un carácter especial'

    if (!form.confirmPassword)
      errors.value.confirmPassword = 'Confirma tu nueva contraseña'
    else if (form.confirmPassword !== form.newPassword)
      errors.value.confirmPassword = 'Las contraseñas no coinciden'

    return !errors.value.newPassword && !errors.value.confirmPassword
  }

  const submit = async (): Promise<RequestResult> => {
    if (!validate())
      return { success: false, message: 'Datos inválidos' }

    submitting.value = true

    try {
      await profileService.changePassword(form.newPassword)
      showSnackbar({ text: 'Contraseña actualizada', color: 'success' })
      reset()
      return { success: true }
    }
    catch (error: any) {
      const apiErrors = error?.data?.errors
      if (apiErrors?.newPassword) {
        errors.value.newPassword = apiErrors.newPassword
      }

      const message = error?.data?.message || 'No se pudo cambiar la contraseña'
      showSnackbar({ text: message, color: 'error' })
      return { success: false, message }
    }
    finally {
      submitting.value = false
    }
  }

  return {
    form,
    errors,
    submitting,
    submit,
    reset,
  }
}
