import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { jobOfferService } from '../services/JobOfferService'
import type { JobOffer } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useJobOfferList = () => {
  const items = ref<JobOffer[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const search = ref('')

  const { showSnackbar } = useSnackbar()

  const fetchJobOffers = async () => {
    loading.value = true
    try {
      const { items: data, paginate } = await jobOfferService.fetchList({
        page: page.value,
        size: itemsPerPage.value,
        search: search.value,
      })

      items.value = data
      totalItems.value = paginate?.totalElements ?? data.length
    }
    catch (error: any) {
      console.error('Error al cargar ofertas laborales:', error)
      showSnackbar({ text: 'No se pudieron cargar las ofertas laborales', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  onMounted(fetchJobOffers)

  watchDebounced(search, () => {
    page.value = 1
    fetchJobOffers()
  }, { debounce: 400, maxWait: 800 })

  const setPage = (value: number) => {
    page.value = value
    fetchJobOffers()
  }

  const setItemsPerPage = (value: number) => {
    itemsPerPage.value = value
    page.value = 1
    fetchJobOffers()
  }

  const setSearch = (value: string) => {
    search.value = value
  }

  const deleteJobOffer = async (jobOfferId: number) => {
    loading.value = true
    try {
      await jobOfferService.remove(jobOfferId)
      showSnackbar({ text: 'Oferta eliminada correctamente', color: 'success' })
      await fetchJobOffers()
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
    fetchJobOffers,
    setPage,
    setItemsPerPage,
    setSearch,
    deleteJobOffer,
  }
}
