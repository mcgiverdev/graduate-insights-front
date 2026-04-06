import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { jobService } from '../services/JobService'
import type { Job } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useJobList = () => {
  const items = ref<Job[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchJobs = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await jobService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar trabajos:', error)
      showSnackbar({ text: 'No se pudieron cargar los trabajos', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchJobs)

  watchDebounced(search, () => {
    page.value = 1
    fetchJobs()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchJobs()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchJobs()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteJob = async (jobId: number) => {
    loading.value = true
    try {
      await jobService.remove(jobId)
      showSnackbar({ text: 'Trabajo eliminado correctamente', color: 'success' })
      await fetchJobs()
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
    fetchJobs,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteJob,
  }
}
