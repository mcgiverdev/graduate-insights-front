<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FeedFilters from '@/components/feed/FeedFilters.vue'
import FeedList from '@/components/feed/FeedList.vue'
import { type FeedItem, useFeedService } from '@/composables/useFeedService'
import { useSnackbar } from '@/composables/useSnackbar'

const feedItems = ref<FeedItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const showEvents = ref(true)
const showJobs = ref(true)

const feedService = useFeedService()
const snackbar = useSnackbar()

const loadFeed = async (page = 1, append = false) => {
  try {
    loading.value = true

    const response = await feedService.getFeed(page)

    if (append)
      feedItems.value = [...feedItems.value, ...response.data]

    else
      feedItems.value = response.data

    totalPages.value = response.paginate.total_pages
    currentPage.value = response.paginate.current_page
  }
  catch (error) {
    snackbar.show({
      text: 'Error al cargar el feed',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

const handleLoadMore = () => {
  if (currentPage.value < totalPages.value)
    loadFeed(currentPage.value + 1, true)
}

const filteredItems = computed(() => {
  return feedItems.value.filter(item => {
    if (item.tipo === 'EVENT' && !showEvents.value)
      return false
    if (item.tipo === 'JOB_OFFER' && !showJobs.value)
      return false

    return true
  })
})

const hasMore = computed(() => {
  return currentPage.value < totalPages.value
})

// Cargar datos iniciales
loadFeed()

// Manejar cambios en los filtros
watch([showEvents, showJobs], () => {
  // Reiniciar la paginación cuando cambian los filtros
  currentPage.value = 1
  loadFeed()
})

definePageMeta({
  middleware: ['auth'],
  roles: ['GRADUATE', 'DIRECTOR'],
})
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <h1 class="text-h4 mb-6">
          Feed de Noticias
        </h1>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        cols="12"
        md="8"
        lg="9"
      >
        <FeedList
          :items="filteredItems"
          :loading="loading"
          :has-more="hasMore"
          @load-more="handleLoadMore"
        />
      </VCol>

      <!-- Sidebar -->
      <VCol
        cols="12"
        md="4"
        lg="3"
      >
        <FeedFilters
          :show-events="showEvents"
          :show-jobs="showJobs"
          @update:show-events="showEvents = $event"
          @update:show-jobs="showJobs = $event"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
