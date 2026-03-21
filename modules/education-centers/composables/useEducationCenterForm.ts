import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { educationCenterService } from '../services/EducationCenterService'
import type { EducationCenterPayload } from '../types'

const formFields = ['nombre', 'direccion']

const normalizeFieldName = (field: string): string | null => {
  if (formFields.includes(field))
    return field

  const snake = field.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (formFields.includes(snake))
    return snake

  const camel = field.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  if (formFields.includes(camel))
    return camel

  return null
}

export const useEducationCenterForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveEducationCenter = async (payload: EducationCenterPayload, educationCenterId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (educationCenterId !== undefined && educationCenterId !== null)
        await educationCenterService.update(educationCenterId, payload)
      else
        await educationCenterService.create(payload)

      showSnackbar({ text: educationCenterId !== undefined && educationCenterId !== null ? 'Centro educativo actualizado' : 'Centro educativo creado', color: 'success' })
      return { success: true }
    }
    catch (error: any) {
      if (error?.data?.errors) {
        const mapped: Record<string, string> = {}
        Object.entries(error.data.errors).forEach(([field, message]) => {
          const normalized = normalizeFieldName(field)
          if (normalized)
            mapped[normalized] = String(message)
        })
        serverErrors.value = mapped
        return { success: false, message: error?.data?.message }
      }

      showSnackbar({ text: error?.message || 'No se pudo guardar el centro educativo', color: 'error' })
      return { success: false, message: error?.message }
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
    saveEducationCenter,
    clearServerErrors,
  }
}
