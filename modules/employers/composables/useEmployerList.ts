import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { employerService } from '../services/EmployerService'
import type { Employer } from '../types'

export const useEmployerList = () => {
  const items = ref<Employer[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchEmployers = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await employerService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar empleadores:', error)
      showSnackbar({ text: 'No se pudieron cargar los empleadores', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchEmployers)

  watchDebounced(search, () => {
    page.value = 1
    fetchEmployers()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchEmployers()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchEmployers()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteEmployer = async (employerId: number) => {
    loading.value = true
    try {
      await employerService.remove(employerId)
      showSnackbar({ text: 'Empleador eliminado correctamente', color: 'success' })
      await fetchEmployers()
    }
    catch (error: any) {
      console.error('Error al eliminar empleador:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el empleador', color: 'error' })
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
    fetchEmployers,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteEmployer,
  }
}
