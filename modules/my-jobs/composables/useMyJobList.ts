import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { myJobService } from '../services/MyJobService'
import type { MyJob } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useMyJobList = () => {
  const items = ref<MyJob[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchMyJobs = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await myJobService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar mis trabajos:', error)
      showSnackbar({ text: 'No se pudieron cargar tus trabajos', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchMyJobs)

  watchDebounced(search, () => {
    page.value = 1
    fetchMyJobs()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchMyJobs()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchMyJobs()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteMyJob = async (jobId: number) => {
    loading.value = true
    try {
      await myJobService.remove(jobId)
      showSnackbar({ text: 'Trabajo eliminado correctamente', color: 'success' })
      await fetchMyJobs()
    }
    catch (error: any) {
      console.error('Error al eliminar trabajo:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el trabajo', color: 'error' })
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
    fetchMyJobs,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteMyJob,
  }
}
