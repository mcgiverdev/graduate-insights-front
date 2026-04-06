import { ref } from 'vue'
import { eventService } from '../services/EventService'
import type { EventPayload } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'

const formFields = ['nombre', 'contenido', 'estado', 'directorId', 'eventTypeId']

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

export const useEventForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveEvent = async (payload: EventPayload, eventId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (eventId !== undefined && eventId !== null)
        await eventService.update(eventId, payload)
      else
        await eventService.create(payload)

      showSnackbar({ text: eventId !== undefined && eventId !== null ? 'Evento actualizado' : 'Evento creado', color: 'success' })

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

      showSnackbar({ text: error?.message || 'No se pudo guardar el evento', color: 'error' })

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
    saveEvent,
    clearServerErrors,
  }
}
