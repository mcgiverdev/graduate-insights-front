<script setup lang="ts">
import { computed } from 'vue'
import type { TableEmits, TableProps } from '../types'
import TableBody from './TableBody.vue'
import TableHeader from './TableHeader.vue'

const props = withDefaults(defineProps<TableProps>(), {
  loading: false,
  emptyMessage: 'No hay datos para mostrar.',
  actions: () => ({}),
})

defineEmits<TableEmits>()

const hasActions = computed(() => {
  return Boolean(props.actions?.edit || props.actions?.delete || (props.actions?.custom && props.actions.custom.length > 0))
})
</script>

<template>
  <div class="table-container">
    <VTable class="data-table">
      <TableHeader
        :columns="columns"
        :has-actions="hasActions"
      />
      <TableBody
        :columns="columns"
        :items="items"
        :loading="loading"
        :empty-message="emptyMessage"
        :actions="actions"
        :has-actions="hasActions"
      />
    </VTable>
  </div>
</template>

<style scoped>
.table-container {
  position: relative;
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 10%);
  overflow-x: auto;
}

.data-table {
  border-collapse: collapse;
  inline-size: 100%;
}

:deep(.v-table) {
  background-color: transparent !important;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-table .v-table__wrapper) {
  overflow-x: auto;
}

:deep(.v-table th) {
  background-color: rgb(var(--v-theme-surface-variant));
  border-block-end: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  padding-block: 12px;
  padding-inline: 16px;
  text-align: start;
  white-space: nowrap;
}

:deep(.v-table td) {
  border-block-end: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-block: 12px;
  padding-inline: 16px;
}

:deep(.fixed-column) {
  position: sticky !important;
  z-index: 1;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: -4px 0 8px rgba(0, 0, 0, 10%);
  inset-inline-end: 0;
}

:deep(.v-table tr:hover) {
  background-color: rgb(var(--v-theme-surface-variant), 0.05);
}

:deep(.v-table tr:last-child td) {
  border-block-end: none;
}

/* Estilos para estado de carga y vacío */
:deep(.v-table__empty-wrapper) {
  padding: 24px;
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: center;
}

:deep(.v-table__loading) {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface), 0.7);
  inset: 0;
}
</style>
