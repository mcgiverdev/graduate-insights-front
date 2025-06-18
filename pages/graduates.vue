<script setup lang="ts">
import ResourceManager from '@/library/components/ResourceManager.vue'
import { GraduateResource } from '@/library/resources/graduates/GraduateResource'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

const resource = new GraduateResource()
</script>

<template>
  <VCard>
    <VCardText>
      <ResourceManager :resource="resource" />
    </VCardText>
  </VCard>
</template>

<style lang="scss">
:deep(.v-data-table) {
  .v-data-table-header__content {
    justify-content: center;
  }
}

:deep(.v-data-table__td) {
  text-align: center !important;
}

:deep(.v-data-table-footer) {
  .v-data-footer__pagination {
    margin-block: 0;
    margin-inline: 1rem;
  }
}
</style>
