<script setup lang="ts">
import type { FeedItem } from '../../types'
import { formatDateOnly } from '@/utils/dateUtils'
import { useRoles } from '@/composables/useRoles'

interface Props {
  jobOffer: FeedItem
}

const props = defineProps<Props>()
const { isGraduate } = useRoles()

function postular() {
  if (!props.jobOffer.link)
    return

  const url = props.jobOffer.link.startsWith('http')
    ? props.jobOffer.link
    : `https://${props.jobOffer.link}`

  window.open(url, '_blank')
}
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
        {{ jobOffer.empresa }} · {{ formatDateOnly(jobOffer.fecha_creacion) }}
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <p class="text-body-1">
        {{ jobOffer.contenido }}
      </p>
    </VCardText>

    <VDivider />

    <VCardText class="d-flex align-center justify-space-between pt-2">
      <VBtn
        v-if="isGraduate && jobOffer.link"
        color="success"
        variant="elevated"
        size="small"
        prepend-icon="tabler-send"
        @click="postular"
      >
        Postular
      </VBtn>
      <div v-else />

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
