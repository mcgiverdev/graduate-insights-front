import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { eventService } from '../services/EventService'
import type { Event } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useEventList = () => {
  const items = ref<Event[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchEvents = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await eventService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar eventos:', error)
      showSnackbar({ text: 'No se pudieron cargar los eventos', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchEvents)

  watchDebounced(search, () => {
    page.value = 1
    fetchEvents()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchEvents()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchEvents()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteEvent = async (eventId: number) => {
    loading.value = true
    try {
      await eventService.remove(eventId)
      showSnackbar({ text: 'Evento eliminado correctamente', color: 'success' })
      await fetchEvents()
    }
    catch (error: any) {
      console.error('Error al eliminar evento:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el evento', color: 'error' })
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
    fetchEvents,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteEvent,
  }
}
