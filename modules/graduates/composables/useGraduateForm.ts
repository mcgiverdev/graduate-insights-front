import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { graduateService } from '../services/GraduateService'
import type { GraduatePayload } from '../types'

const normalizeFieldName = (field: string, validFields: string[]): string | null => {
  if (validFields.includes(field))
    return field

  const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (validFields.includes(snakeCase))
    return snakeCase

  const camelCase = field.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  if (validFields.includes(camelCase))
    return camelCase

  return null
}

const formFields = ['nombres', 'apellidos', 'fechaNacimiento', 'genero', 'correo', 'dni', 'celular', 'contrasena', 'fechaInicio', 'fechaFin', 'cvPath']

export const useGraduateForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveGraduate = async (payload: GraduatePayload, graduateId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (graduateId !== undefined && graduateId !== null)
        await graduateService.update(graduateId, payload)
      else
        await graduateService.create(payload)

      showSnackbar({ text: graduateId !== undefined && graduateId !== null ? 'Graduado actualizado' : 'Graduado creado', color: 'success' })

      return { success: true }
    }
    catch (error: any) {
      if (error?.data?.errors) {
        const mappedErrors: Record<string, string> = {}

        Object.entries(error.data.errors).forEach(([field, message]) => {
          const normalized = normalizeFieldName(field, formFields)
          if (normalized)
            mappedErrors[normalized] = String(message)
        })

        serverErrors.value = mappedErrors

        return {
          success: false,
          message: error?.data?.message || 'Corrige los errores e intenta nuevamente',
        }
      }

      showSnackbar({ text: error?.message || 'No se pudo guardar el graduado', color: 'error' })

      return {
        success: false,
        message: error?.message,
      }
    }
    finally {
      submitting.value = false
    }
  }

  const clearServerErrors = () => {
    serverErrors.value = {}
  }

  return {
    submitting,
    serverErrors,
    saveGraduate,
    clearServerErrors,
  }
}
