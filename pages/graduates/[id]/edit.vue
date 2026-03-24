<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { GraduateTabsEditorForm } from '@/src/features/graduates'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

const route = useRoute()

const graduateId = computed(() => {
  const rawId = (route.params as Record<string, unknown>).id
  const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId
  const parsed = Number(normalizedId)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})

</script>

<template>
  <GraduateTabsEditorForm
    v-if="graduateId"
    :graduate-id="graduateId"
  />

  <VAlert
    v-else
    type="warning"
    variant="tonal"
  >
    El ID del graduado no es valido.
  </VAlert>
</template>
