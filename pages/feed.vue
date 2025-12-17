<script setup lang="ts">
import FeedFilters from '@/modules/feed/components/FeedFilters.vue'
import FeedList from '@/modules/feed/components/FeedList.vue'
import { useFeedList } from '@/modules/feed/composables/useFeedList'

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
          :items="items"
          :loading="loading"
          :has-more="hasMore"
          @load-more="loadMore"
        />
      </VCol>

      <!-- Sidebar -->
      <VCol
        cols="12"
        md="4"
        lg="3"
      >
        <FeedFilters
          :show-events="filters.showEvents"
          :show-jobs="filters.showJobs"
          @update:show-events="setShowEvents"
          @update:show-jobs="setShowJobs"
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
