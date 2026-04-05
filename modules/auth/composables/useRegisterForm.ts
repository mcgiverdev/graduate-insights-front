import { reactive, ref } from 'vue'
import { authModuleService } from '../services/AuthService'
import type { RegisterFormValues, VerificationResult } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

const INITIAL_VALUES: RegisterFormValues = {
  nombres: '',
  apellidos: '',
  dni: '',
  celular: '',
  correo: '',
  contrasena: '',
}

type RegisterField = keyof RegisterFormValues

const fieldValidators: Record<RegisterField, (value: string) => string | null> = {
  nombres: value => (value.trim().length ? null : 'Ingresa tus nombres.'),
  apellidos: value => (value.trim().length ? null : 'Ingresa tus apellidos.'),
  dni: value => (/^\d{8}$/.test(value) ? null : 'El DNI debe tener exactamente 8 dígitos.'),
  celular: value => (/^9\d{8}$/.test(value) ? null : 'El número debe iniciar con 9 y tener 9 dígitos.'),
  correo: value => (/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value.trim()) ? null : 'Ingresa un correo válido.'),
  contrasena: value => (value.trim().length >= 6 ? null : 'La contraseña debe tener al menos 6 caracteres.'),
}

export const useRegisterForm = () => {
  const form = reactive<RegisterFormValues>({ ...INITIAL_VALUES })

  const errors = reactive<Record<RegisterField, string>>({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    correo: '',
    contrasena: '',
  })

  const loading = ref(false)
  const isPasswordVisible = ref(false)
  const { showSnackbar } = useSnackbar()

  const validateField = (field: RegisterField): boolean => {
    const validator = fieldValidators[field]
    const value = form[field]
    const validationMessage = validator(value)

    errors[field] = validationMessage ?? ''

    return !validationMessage
  }

  const validateForm = () => {
    return (Object.keys(fieldValidators) as RegisterField[])
      .map(validateField)
      .every(Boolean)
  }

  const applyFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors)
      return

    Object.entries(fieldErrors).forEach(([key, message]) => {
      if ((key as RegisterField) in form)
        errors[key as RegisterField] = message
    })
  }

  const handleSubmit = async (): Promise<VerificationResult> => {
    if (!validateForm()) {
      showSnackbar({ text: 'Revisa los datos resaltados e inténtalo nuevamente.', color: 'error' })

      return { success: false, message: 'Formulario inválido.' }
    }

    loading.value = true

    try {
      const payload: RegisterFormValues = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        dni: form.dni.trim(),
        celular: form.celular.trim(),
        correo: form.correo.trim().toLowerCase(),
        contrasena: form.contrasena.trim(),
      }

      const result = await authModuleService.registerGraduate(payload)

      if (!result.success) {
        applyFieldErrors(result.fieldErrors)
        showSnackbar({ text: result.message || 'No pudimos crear tu cuenta.', color: 'error' })

        return result
      }

      showSnackbar({ text: result.message || 'Registro exitoso.', color: 'success' })

      return result
    }
    finally {
      loading.value = false
    }
  }

  return {
    form,
    errors,
    loading,
    isPasswordVisible,
    validateField,
    handleSubmit,
  }
}
