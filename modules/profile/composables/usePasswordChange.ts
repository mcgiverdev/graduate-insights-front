import { reactive, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { useUser } from '@/composables/useUser'
import { profileService } from '../services/ProfileService'

interface PasswordForm {
  newPassword: string
  confirmPassword: string
}

const createInitialForm = (): PasswordForm => ({
  newPassword: '',
  confirmPassword: '',
})

export const usePasswordChange = () => {
  const form = reactive<PasswordForm>(createInitialForm())
  const errors = ref<Record<keyof PasswordForm, string | undefined>>({
    newPassword: undefined,
    confirmPassword: undefined,
  })
  const submitting = ref(false)
  const { showSnackbar } = useSnackbar()
  const { user } = useUser()

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
    else if (form.newPassword.length < 8)
      errors.value.newPassword = 'Debe tener al menos 8 caracteres'

    if (!form.confirmPassword)
      errors.value.confirmPassword = 'Confirma tu nueva contraseña'
    else if (form.confirmPassword !== form.newPassword)
      errors.value.confirmPassword = 'Las contraseñas no coinciden'

    return !errors.value.newPassword && !errors.value.confirmPassword
  }

  const submit = async (): Promise<RequestResult> => {
    if (!validate())
      return { success: false, message: 'Datos inválidos' }

    const email = user.value?.email
    if (!email) {
      showSnackbar({ text: 'No se pudo determinar el correo del usuario', color: 'error' })
      return { success: false, message: 'Usuario no disponible' }
    }

    submitting.value = true

    try {
      await profileService.changePassword({ email, newPassword: form.newPassword })
      showSnackbar({ text: 'Contraseña actualizada', color: 'success' })
      reset()
      return { success: true }
    }
    catch (error: any) {
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
