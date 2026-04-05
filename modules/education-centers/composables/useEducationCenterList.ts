import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { educationCenterService } from '../services/EducationCenterService'
import type { EducationCenter } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useEducationCenterList = () => {
  const items = ref<EducationCenter[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchEducationCenters = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await educationCenterService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar centros educativos:', error)
      showSnackbar({ text: 'No se pudieron cargar los centros educativos', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchEducationCenters)

  watchDebounced(search, () => {
    page.value = 1
    fetchEducationCenters()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchEducationCenters()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchEducationCenters()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteEducationCenter = async (educationCenterId: number) => {
    loading.value = true
    try {
      await educationCenterService.remove(educationCenterId)
      showSnackbar({ text: 'Centro educativo eliminado', color: 'success' })
      await fetchEducationCenters()
    }
    catch (error: any) {
      console.error('Error al eliminar centro educativo:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar el centro educativo', color: 'error' })
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
    fetchEducationCenters,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteEducationCenter,
  }
}
