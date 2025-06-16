<script setup lang="ts">
import ResourceManager from '@/library/components/ResourceManager.vue'
import { DirectorModel } from '@/library/models/DirectorModel'

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <ResourceManager
    :model-definition="DirectorModel"
    title="Administración de Directores"
    create-button-text="Nuevo director"
    delete-confirm-title="Confirmar eliminación"
    delete-confirm-text="¿Estás seguro que deseas eliminar este director? Esta acción no se puede deshacer."
  />
</template>

<style scoped>
/* Los errores de :deep son falsos positivos del linter, es una característica válida de Vue */
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
