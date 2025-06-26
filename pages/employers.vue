<script setup lang="ts">
import ResourceManager from '@/library/components/ResourceManager.vue'
import { EmployerResource } from '@/library/resources/employers/EmployerResource'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

const resource = new EmployerResource()
</script>

<template>
  <ResourceManager :resource="resource" />
</template>

<style scoped>
.table-container {
  position: relative;
  overflow-x: auto;
}

.fixed-column {
  position: sticky !important;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  box-shadow: -2px 0 4px rgba(0, 0, 0, 10%);
  inset-inline-end: 0;
}

:deep(.v-table) {
  inline-size: 100%;
}

:deep(.v-table .v-table__wrapper) {
  overflow-x: auto;
}

:deep(.v-table th),
:deep(.v-table td) {
  padding-block: 0;
  padding-inline: 16px;
}
</style>

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
