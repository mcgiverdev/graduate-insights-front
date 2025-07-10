<script setup lang="ts">
interface Props {
  showEvents: boolean
  showJobs: boolean
}

interface Emits {
  (e: 'update:showEvents', value: boolean): void
  (e: 'update:showJobs', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateShowEvents = (value: boolean) => {
  emit('update:showEvents', value)
}

const updateShowJobs = (value: boolean) => {
  emit('update:showJobs', value)
}
</script>

<template>
  <VCard>
    <VCardTitle class="text-h6 pa-4">
      Filtros
    </VCardTitle>
    <VCardText>
      <VCheckbox
        :model-value="showEvents"
        label="Eventos"
        hide-details
        @update:model-value="updateShowEvents"
      />
      <VCheckbox
        :model-value="showJobs"
        label="Ofertas Laborales"
        hide-details
        @update:model-value="updateShowJobs"
      />
    </VCardText>
  </VCard>
</template>
