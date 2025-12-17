<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import FeedEventCard from './cards/FeedEventCard.vue'
import FeedJobOfferCard from './cards/FeedJobOfferCard.vue'
import type { FeedItem } from '../types'

interface Props {
  items: FeedItem[]
  loading: boolean
  hasMore: boolean
}

interface Emits {
  (e: 'load-more'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const observer = ref<IntersectionObserver | null>(null)
const loadingTrigger = ref<HTMLElement | null>(null)

const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(
    entries => {
      const target = entries[0]
      if (target.isIntersecting && !props.loading && props.hasMore)
        emit('load-more')
    },
    {
      rootMargin: '100px',
      threshold: 0.1,
    },
  )

  if (loadingTrigger.value)
    observer.value.observe(loadingTrigger.value)
}

onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer.value)
    observer.value.disconnect()
})
</script>

<template>
  <div class="feed-list">
    <div
      v-if="loading && items.length === 0"
      class="d-flex justify-center align-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="32"
      />
    </div>

    <template v-else>
      <TransitionGroup name="feed-item">
        <template
          v-for="item in items"
          :key="item.tipo + item.id"
        >
          <FeedEventCard
            v-if="item.tipo === 'EVENT'"
            :event="item"
          />
          <FeedJobOfferCard
            v-else-if="item.tipo === 'JOB_OFFER'"
            :job-offer="item"
          />
        </template>
      </TransitionGroup>

      <div
        ref="loadingTrigger"
        class="mt-4"
      >
        <div
          v-if="loading"
          class="d-flex justify-center py-4"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="24"
          />
        </div>
        <VAlert
          v-else-if="items.length === 0"
          type="info"
          variant="tonal"
          class="text-center"
        >
          No hay elementos para mostrar en el feed.
        </VAlert>
        <div
          v-else-if="!hasMore"
          class="text-center text-disabled py-4"
        >
          Has llegado al final del feed
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.feed-item-enter-active,
.feed-item-leave-active {
  transition: all 0.3s ease;
}

.feed-item-enter-from,
.feed-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.feed-item-move {
  transition: transform 0.3s ease;
}
</style>
