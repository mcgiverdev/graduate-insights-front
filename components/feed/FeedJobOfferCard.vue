<script setup lang="ts">
import type { FeedItem } from '@/composables/useFeedService'

interface Props {
  jobOffer: FeedItem
}

const props = defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <VCard class="mb-4">
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-briefcase"
          size="32"
          class="me-3"
          color="success"
        />
      </template>

      <VCardTitle>{{ jobOffer.titulo }}</VCardTitle>
      <VCardSubtitle>
        {{ jobOffer.empresa }} - {{ formatDate(jobOffer.fechaCreacion) }}
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <p class="text-body-1 mb-2">
        {{ jobOffer.descripcion }}
      </p>
      <p class="text-body-2">
        {{ jobOffer.contenido }}
      </p>
    </VCardText>

    <VCardText>
      <div class="d-flex align-center mb-2">
        <VIcon
          icon="tabler-map-pin"
          size="20"
          class="me-2"
        />
        <span class="text-body-2">{{ jobOffer.ubicacion }}</span>
      </div>
      <div class="d-flex align-center">
        <VIcon
          icon="tabler-cash"
          size="20"
          class="me-2"
        />
        <span class="text-body-2">{{ jobOffer.salario }}</span>
      </div>
    </VCardText>

    <VCardText>
      <VChip
        color="success"
        size="small"
        class="me-2"
      >
        Oferta Laboral
      </VChip>
      <VChip
        size="small"
        color="secondary"
      >
        {{ jobOffer.empresa }}
      </VChip>
    </VCardText>
  </VCard>
</template>
