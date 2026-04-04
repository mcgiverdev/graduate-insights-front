<script setup lang="ts">
import { FeedFilters, FeedList, useFeedList } from '@/src/features/feed'

const {
  filters,
  items,
  loading,
  hasMore,
  loadMore,
  setShowEvents,
  setShowJobs,
} = useFeedList()

definePageMeta({
  middleware: ['auth'],
  roles: ['GRADUATE', 'DIRECTOR'],
})
</script>

<template>
  <VContainer>
    <!-- Encabezado + filtros en la misma fila -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-6">
      <h1 class="text-h4">
        Feed de Noticias
      </h1>

      <FeedFilters
        :show-events="filters.showEvents"
        :show-jobs="filters.showJobs"
        @update:show-events="setShowEvents"
        @update:show-jobs="setShowJobs"
      />
    </div>

    <FeedList
      :items="items"
      :loading="loading"
      :has-more="hasMore"
      @load-more="loadMore"
    />
  </VContainer>
</template>
