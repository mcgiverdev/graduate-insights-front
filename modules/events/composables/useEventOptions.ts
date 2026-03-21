import { onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { keyValueService } from '@/modules/shared/services/KeyValueService'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

export const useEventOptions = () => {
  const directorOptions = ref<KeyValueOption[]>([])
  const eventTypeOptions = ref<KeyValueOption[]>([])
  const loadingOptions = ref(false)
  const { showSnackbar } = useSnackbar()

  const loadOptions = async () => {
    loadingOptions.value = true
    try {
      const [directors, eventTypes] = await Promise.all([
        keyValueService.fetch('/graduate-insights/v1/api/director/list'),
        keyValueService.fetch('/graduate-insights/v1/api/event_types/list'),
      ])

      directorOptions.value = directors
      eventTypeOptions.value = eventTypes
    }
    catch (error) {
      console.error('Error al cargar opciones de eventos:', error)
      showSnackbar({ text: 'No se pudieron cargar las opciones del formulario', color: 'error' })
    }
    finally {
      loadingOptions.value = false
    }
  }

  onMounted(() => {
    if (!directorOptions.value.length || !eventTypeOptions.value.length)
      loadOptions()
  })

  return {
    directorOptions,
    eventTypeOptions,
    loadingOptions,
    loadOptions,
  }
}
