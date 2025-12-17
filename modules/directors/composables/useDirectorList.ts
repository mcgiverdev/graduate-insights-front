import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { directorService } from '../services/DirectorService'
import type { Director } from '../types'

export const useDirectorList = () => {
  const items = ref<Director[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchDirectors = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await directorService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar directores:', error)
      showSnackbar({ text: 'No se pudieron cargar los directores', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchDirectors)

  watchDebounced(search, () => {
    page.value = 1
    fetchDirectors()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchDirectors()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchDirectors()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteDirector = async (directorId: number) => {
    loading.value = true
    try {
      await directorService.remove(directorId)
      showSnackbar({ text: 'Director eliminado correctamente', color: 'success' })
      await fetchDirectors()
    }
    catch (error: any) {
      console.error('Error al eliminar director:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el director', color: 'error' })
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
    fetchDirectors,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteDirector,
  }
}
