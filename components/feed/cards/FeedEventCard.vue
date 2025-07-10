<script setup lang="ts">
import type { FeedItem } from '@/composables/useFeedService'
import { formatDate } from '@/utils/dateUtils'

interface Props {
  event: FeedItem
}

defineProps<Props>()
</script>

<template>
  <VCard class="feed-card mb-4">
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-calendar-event"
          size="32"
          class="me-3"
          color="primary"
        />
      </template>

      <VCardTitle class="text-primary">
        {{ event.titulo }}
      </VCardTitle>
      <VCardSubtitle v-if="event.tipo_evento">
        {{ event.tipo_evento }} · {{ formatDate(event.fecha_creacion) }}
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <p class="text-body-1">
        {{ event.contenido }}
      </p>
    </VCardText>

    <VDivider />

    <VCardText class="d-flex align-center justify-space-between pt-2">
      <div class="d-flex align-center">
        <VIcon
          icon="tabler-user"
          size="20"
          class="me-2"
          color="secondary"
        />
        <span class="text-secondary text-body-2">{{ event.fuente }}</span>
      </div>
      <VChip
        v-if="event.tipo_evento"
        color="primary"
        size="small"
        variant="flat"
      >
        {{ event.tipo_evento }}
      </VChip>
    </VCardText>
  </VCard>
</template>

<style scoped>
.feed-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: transform 0.2s;
}

.feed-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 10%);
  transform: translateY(-2px);
}
</style>
