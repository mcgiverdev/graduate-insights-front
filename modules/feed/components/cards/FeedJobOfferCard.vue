<script setup lang="ts">
import type { FeedItem } from '../../types'
import { formatReadableDate } from '@/utils/dateUtils'

interface Props {
  jobOffer: FeedItem
}

defineProps<Props>()
</script>

<template>
  <VCard class="feed-card mb-4">
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-briefcase"
          size="32"
          class="me-3"
          color="success"
        />
      </template>

      <VCardTitle class="text-success">
        {{ jobOffer.titulo }}
      </VCardTitle>
      <VCardSubtitle v-if="jobOffer.empresa">
        {{ jobOffer.empresa }} · {{ formatReadableDate(jobOffer.fecha_creacion) }}
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <p class="text-body-1">
        {{ jobOffer.contenido }}
      </p>
    </VCardText>

    <VDivider />

    <VCardText class="d-flex align-center justify-space-between pt-2">
      <div class="d-flex align-center">
        <VIcon
          icon="tabler-building"
          size="20"
          class="me-2"
          color="secondary"
        />
        <span class="text-secondary text-body-2">{{ jobOffer.fuente }}</span>
      </div>
      <VChip
        color="success"
        size="small"
        variant="flat"
      >
        Oferta Laboral
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
