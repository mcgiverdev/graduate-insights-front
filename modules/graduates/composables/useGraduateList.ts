import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { graduateService } from '../services/GraduateService'
import type { Graduate } from '../types'

// Estado a nivel de módulo — persiste entre navegaciones (mismo patrón que useUser)
const items = ref<Graduate[]>([])
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const search = ref('')
const showOnlyPending = ref(false)
let lastFetchedAt = 0
const CACHE_TTL_MS = 30_000 // 30 segundos

export const useGraduateList = () => {
  const { showSnackbar } = useSnackbar()

  const fetchGraduates = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await graduateService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
        validated: showOnlyPending.value ? false : undefined,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
      lastFetchedAt = Date.now()
    }
    catch (error: any) {
      console.error('Error al cargar graduados:', error)
      showSnackbar({ text: 'No se pudieron cargar los graduados', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    const isStale = Date.now() - lastFetchedAt > CACHE_TTL_MS
    if (items.value.length === 0 || isStale)
      fetchGraduates()
  })

  watchDebounced(search, () => {
    page.value = 1
    fetchGraduates()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchGraduates()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchGraduates()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const setShowOnlyPending = (value: boolean) => {
    showOnlyPending.value = value
    page.value = 1
    fetchGraduates()
  }

  const deleteGraduate = async (graduateId: number) => {
    loading.value = true
    try {
      await graduateService.remove(graduateId)
      showSnackbar({ text: 'Graduado eliminado correctamente', color: 'success' })
      await fetchGraduates()
    }
    catch (error: any) {
      console.error('Error al eliminar graduado:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el graduado', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const activateGraduate = async (graduateId: number) => {
    loading.value = true
    try {
      await graduateService.activate(graduateId)
      showSnackbar({ text: 'Cuenta activada correctamente', color: 'success' })
      await fetchGraduates()
    }
    catch (error: any) {
      console.error('Error al activar graduado:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo activar la cuenta', color: 'error' })
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
    showOnlyPending,
    fetchGraduates,
    setPage,
    setItemsPerPage,
    setSearch,
    setShowOnlyPending,
    deleteGraduate,
    activateGraduate,
  }
}
