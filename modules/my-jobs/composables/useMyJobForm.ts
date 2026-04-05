import { ref } from 'vue'
import { myJobService } from '../services/MyJobService'
import type { MyJobPayload } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'

const formFields = ['compania', 'cargo', 'modalidad', 'fechaInicio', 'fechaFin']

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

export const useMyJobForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveMyJob = async (payload: MyJobPayload, jobId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (jobId !== undefined && jobId !== null)
        await myJobService.update(jobId, payload)
      else
        await myJobService.create(payload)

      showSnackbar({ text: jobId !== undefined && jobId !== null ? 'Trabajo actualizado' : 'Trabajo creado', color: 'success' })

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

      showSnackbar({ text: error?.message || 'No se pudo guardar el trabajo', color: 'error' })

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
    saveMyJob,
    clearServerErrors,
  }
}
