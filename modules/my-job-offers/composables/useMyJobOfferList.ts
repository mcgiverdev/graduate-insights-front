import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { myJobOfferService } from '../services/MyJobOfferService'
import type { MyJobOffer } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useMyJobOfferList = () => {
  const items = ref<MyJobOffer[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchMyJobOffers = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await myJobOfferService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar mis ofertas laborales:', error)
      showSnackbar({ text: 'No se pudieron cargar tus ofertas', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchMyJobOffers)

  watchDebounced(search, () => {
    page.value = 1
    fetchMyJobOffers()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchMyJobOffers()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchMyJobOffers()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteMyJobOffer = async (jobOfferId: number) => {
    loading.value = true
    try {
      await myJobOfferService.remove(jobOfferId)
      showSnackbar({ text: 'Oferta eliminada correctamente', color: 'success' })
      await fetchMyJobOffers()
    }
    catch (error: any) {
      console.error('Error al eliminar oferta:', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo eliminar la oferta', color: 'error' })
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
    fetchMyJobOffers,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteMyJobOffer,
  }
}
