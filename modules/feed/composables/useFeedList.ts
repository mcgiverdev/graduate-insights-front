import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { feedService } from '../services/FeedService'
import type { FeedFiltersState, FeedItem } from '../types'

interface LoadOptions {
  page?: number
  append?: boolean
}

const DEFAULT_PAGE_SIZE = 10

export const useFeedList = () => {
  const items = ref<FeedItem[]>([])
  const loading = ref(false)
  const filters = reactive<FeedFiltersState>({
    showEvents: true,
    showJobs: true,
  })
  const pagination = reactive({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const { showSnackbar } = useSnackbar()

  const loadFeed = async (options: LoadOptions = {}) => {
    const requestedPage = options.page ?? pagination.currentPage ?? 1

    loading.value = true
    try {
      const { items: fetchedItems, paginate } = await feedService.fetchFeed({
        page: requestedPage,
        size: pagination.pageSize,
      })

      items.value = options.append ? [...items.value, ...fetchedItems] : fetchedItems
      pagination.currentPage = paginate.currentPage
      pagination.totalPages = paginate.totalPages
      pagination.totalElements = paginate.totalElements
    }
    catch (error) {
      console.error('Error al cargar el feed:', error)
      showSnackbar({ text: 'No se pudo cargar el feed', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const reload = () => {
    pagination.currentPage = 1
    loadFeed({ page: 1, append: false })
  }

  const loadMore = async () => {
    if (loading.value || pagination.currentPage >= pagination.totalPages)
      return

    await loadFeed({ page: pagination.currentPage + 1, append: true })
  }

  watch(() => [filters.showEvents, filters.showJobs], () => {
    reload()
  })

  onMounted(() => {
    loadFeed({ page: 1 })
  })

  const filteredItems = computed(() => {
    return items.value.filter(item => {
      if (item.tipo === 'EVENT' && !filters.showEvents)
        return false
      if (item.tipo === 'JOB_OFFER' && !filters.showJobs)
        return false

      return true
    })
  })

  const hasMore = computed(() => pagination.currentPage < pagination.totalPages)

  const setShowEvents = (value: boolean) => {
    filters.showEvents = value
  }

  const setShowJobs = (value: boolean) => {
    filters.showJobs = value
  }

  return {
    filters,
    loading,
    items: filteredItems,
    hasMore,
    loadMore,
    reload,
    setShowEvents,
    setShowJobs,
  }
}
