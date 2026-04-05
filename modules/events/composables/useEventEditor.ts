import { ref } from 'vue'
import { eventService } from '../services/EventService'
import type { Event, EventFormValues, EventPayload } from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'
import { useSnackbar } from '@/composables/useSnackbar'

interface UseEventEditorOptions {
  fetchEvents: () => Promise<void>
  saveEvent: (payload: EventPayload, eventId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
  directorOptionsCount: () => number
  eventTypeOptionsCount: () => number
  loadOptions: () => Promise<void>
}

export const useEventEditor = ({
  fetchEvents,
  saveEvent,
  clearServerErrors,
  directorOptionsCount,
  eventTypeOptionsCount,
  loadOptions,
}: UseEventEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedEvent = ref<Event | null>(null)
  const { showSnackbar } = useSnackbar()

  const ensureOptionsLoaded = async () => {
    if (!directorOptionsCount() || !eventTypeOptionsCount())
      await loadOptions()
  }

  const openCreateForm = async () => {
    await ensureOptionsLoaded()
    selectedEvent.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (eventId: number) => {
    await ensureOptionsLoaded()
    clearServerErrors()
    selectedEvent.value = null
    isFormVisible.value = true

    try {
      const event = await eventService.getById(eventId)

      if (!event) {
        showSnackbar({ text: 'No se encontró el evento seleccionado', color: 'error' })
        isFormVisible.value = false

        return
      }

      selectedEvent.value = event
    }
    catch (error) {
      console.error('Error al obtener evento', error)
      showSnackbar({ text: 'No se pudo cargar el evento', color: 'error' })
      isFormVisible.value = false
    }
  }

  const handleFormSubmit = async (values: EventFormValues) => {
    const payload = toPayload(values)
    const result = await saveEvent(payload, selectedEvent.value?.eventId)

    if (result.success) {
      isFormVisible.value = false
      selectedEvent.value = null
      await fetchEvents()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedEvent.value = null
  }

  return {
    isFormVisible,
    selectedEvent,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
