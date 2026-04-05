import { ref } from 'vue'
import type {
  EventType,
  EventTypeFormValues,
  EventTypePayload,
} from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'

interface UseEventTypeEditorOptions {
  fetchEventTypes: () => Promise<void>
  saveEventType: (payload: EventTypePayload, eventTypeId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useEventTypeEditor = ({ fetchEventTypes, saveEventType, clearServerErrors }: UseEventTypeEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedEventType = ref<EventType | null>(null)

  const openCreateForm = () => {
    selectedEventType.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = (eventType: EventType) => {
    selectedEventType.value = eventType
    clearServerErrors()
    isFormVisible.value = true
  }

  const handleFormSubmit = async (values: EventTypeFormValues) => {
    const payload = toPayload(values)
    const result = await saveEventType(payload, selectedEventType.value?.eventTypeId)

    if (result.success) {
      isFormVisible.value = false
      selectedEventType.value = null
      await fetchEventTypes()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedEventType.value = null
  }

  return {
    isFormVisible,
    selectedEventType,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
