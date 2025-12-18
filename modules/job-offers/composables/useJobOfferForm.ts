import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { jobOfferService } from '../services/JobOfferService'
import type { JobOfferPayload } from '../types'

const formFields = ['titulo', 'link', 'descripcion', 'employerId']

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

export const useJobOfferForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveJobOffer = async (payload: JobOfferPayload, jobOfferId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (jobOfferId !== undefined && jobOfferId !== null)
        await jobOfferService.update(jobOfferId, payload)
      else
        await jobOfferService.create(payload)

      showSnackbar({ text: jobOfferId !== undefined && jobOfferId !== null ? 'Oferta actualizada' : 'Oferta creada', color: 'success' })
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

      showSnackbar({ text: error?.message || 'No se pudo guardar la oferta laboral', color: 'error' })
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
    saveJobOffer,
    clearServerErrors,
  }
}
