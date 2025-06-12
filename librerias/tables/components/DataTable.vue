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
    <VTable class="mb-4">
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
  overflow-x: auto;
}

:deep(.fixed-column) {
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
