import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { eventTypeService } from '../services/EventTypeService'
import type { EventType } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useEventTypeList = () => {
  const items = ref<EventType[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchEventTypes = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await eventTypeService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar tipos de evento:', error)
      showSnackbar({ text: 'No se pudieron cargar los tipos de eventos', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchEventTypes)

  watchDebounced(search, () => {
    page.value = 1
    fetchEventTypes()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchEventTypes()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchEventTypes()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteEventType = async (eventTypeId: number) => {
    loading.value = true
    try {
      await eventTypeService.remove(eventTypeId)
      showSnackbar({ text: 'Tipo de evento eliminado', color: 'success' })
      await fetchEventTypes()
    }
    catch (error: any) {
      console.error('Error al eliminar tipo de evento:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el tipo de evento', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const pagination = computed(() => ({
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    totalItems: totalItems.value,
  }))

  return {
    items,
    loading,
    search,
    pagination,
    fetchEventTypes,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteEventType,
  }
}
