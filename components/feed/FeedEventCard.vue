<script setup lang="ts">
import type { FeedItem } from '@/composables/useFeedService'

import { formatDate } from '@/utils/dateUtils'

interface Props {
  event: FeedItem
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

defineProps<{
  jobOffer: FeedItem
}>()
</script>
<template>
  <VCard class="mb-4">
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-calendar-event"
          size="32"
          class="me-3"
          color="primary"
        />
      </template>

      <VCardTitle>{{ event.titulo }}</VCardTitle>
      <VCardSubtitle>
        {{ event.tipoEvento }} - {{ formatDate(event.fechaCreacion) }}
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <p class="text-body-1 mb-2">
        {{ event.descripcion }}
      </p>
      <p class="text-body-2">
        {{ event.contenido }}
      </p>
    </VCardText>

    <VCardText>
      <VChip
        color="primary"
        size="small"
        class="me-2"
      >
        {{ event.tipoEvento }}
      </VChip>
      <VChip
        size="small"
        color="secondary"
      >
        {{ event.fuente }}
      </VChip>
    </VCardText>
  </VCard>
</template>

```vue:pages/feed.vue
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
        <!-- Loader -->
        <div
          v-if="loading"
          class="d-flex justify-center align-center pa-4"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>

        <!-- Feed Items -->
        <template v-else>
          <template
            v-for="item in feedItems"
            :key="item.id"
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

          <!-- Paginación -->
          <div class="d-flex justify-center mt-4">
            <VPagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              @update:model-value="handlePageChange"
            />
          </div>
        </template>
      </VCol>

      <!-- Sidebar -->
      <VCol
        cols="12"
        md="4"
        lg="3"
      >
        <VCard>
          <VCardTitle class="text-h6 pa-4">
            Filtros
          </VCardTitle>
          <VCardText>
            <VCheckbox
              label="Eventos"
              hide-details
            />
            <VCheckbox
              label="Ofertas Laborales"
              hide-details
            />
          </VCardText>
        </VCard>
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

```typescript:navigation/vertical/index.ts
// ... importaciones existentes ...

export default [
  // ... otros items de navegación ...
  {
    title: 'Feed',
    to: { name: 'feed' },
    icon: { icon: 'tabler-news' },
    roles: ['GRADUATE', 'DIRECTOR'],
  },
  // ... otros items de navegación ...
]

```

Características principales de la implementación:

1. **Servicio dedicado** (`useFeedService`):
   - Maneja las llamadas a la API
   - Tipado fuerte con TypeScript
   - Manejo de paginación

2. **Componentes de tarjetas separados**:
   - `FeedEventCard` para eventos
   - `FeedJobOfferCard` para ofertas laborales
   - Diseño específico para cada tipo de contenido

3. **Página principal**:
   - Paginación
   - Loading states
   - Manejo de errores
   - Sidebar con filtros (preparado para futura implementación)
   - Responsive layout

4. **Seguridad**:
   - Middleware de autenticación
   - Restricción por roles (GRADUATE y DIRECTOR)

5. **UI/UX**:
   - Iconos distintivos para cada tipo de contenido
   - Animación hover en las tarjetas
   - Loading states
   - Mensajes de error con snackbar
   - Layout responsive

6. **Extras**:
   - Formateo de fechas
   - Chips para categorías
   - Iconos para ubicación y salario en ofertas laborales

¿Necesitas algún ajuste o tienes alguna funcionalidad adicional que quieras agregar?
