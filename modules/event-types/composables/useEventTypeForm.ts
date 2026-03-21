import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { eventTypeService } from '../services/EventTypeService'
import type { EventTypePayload } from '../types'

const fieldNames = ['nombre']

const normalizeFieldName = (field: string): string | null => {
  if (fieldNames.includes(field))
    return field

  const snake = field.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (fieldNames.includes(snake))
    return snake

  const camel = field.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  if (fieldNames.includes(camel))
    return camel

  return null
}

export const useEventTypeForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveEventType = async (payload: EventTypePayload, eventTypeId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (eventTypeId)
        await eventTypeService.update(eventTypeId, payload)
      else
        await eventTypeService.create(payload)

      showSnackbar({ text: eventTypeId ? 'Tipo de evento actualizado' : 'Tipo de evento creado', color: 'success' })

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

      showSnackbar({ text: error?.message || 'No se pudo guardar el tipo de evento', color: 'error' })

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
    saveEventType,
    clearServerErrors,
  }
}
