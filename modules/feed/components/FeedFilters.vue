<script setup lang="ts">
import type { FeedFiltersState } from '../types'

interface Emits {
  (e: 'update:showEvents', value: boolean): void
  (e: 'update:showJobs', value: boolean): void
}

const props = defineProps<FeedFiltersState>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="d-flex align-center gap-2 flex-wrap">
    <span class="text-body-2 text-medium-emphasis me-1">Filtrar:</span>

    <VChip
      :color="props.showEvents ? 'primary' : undefined"
      :variant="props.showEvents ? 'flat' : 'outlined'"
      size="small"
      class="cursor-pointer"
      prepend-icon="tabler-calendar-event"
      @click="emit('update:showEvents', !props.showEvents)"
    >
      Eventos
    </VChip>

    <VChip
      :color="props.showJobs ? 'success' : undefined"
      :variant="props.showJobs ? 'flat' : 'outlined'"
      size="small"
      class="cursor-pointer"
      prepend-icon="tabler-briefcase"
      @click="emit('update:showJobs', !props.showJobs)"
    >
      Ofertas Laborales
    </VChip>
  </div>
</template>
