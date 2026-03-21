<script setup lang="ts">
import type { Column, TableActions } from '../types'
import { TableActions as TableActionsComponent } from '.'

interface Props {
  columns: Column[]
  items: any[]
  loading: boolean
  emptyMessage: string
  actions?: TableActions
  hasActions: boolean
}

defineProps<Props>()
</script>

<template>
  <tbody>
    <tr v-if="loading">
      <td
        :colspan="hasActions ? columns.length + 1 : columns.length"
        class="text-center"
      >
        <VProgressCircular
          indeterminate
          color="primary"
          size="32"
          class="my-4"
        />
        <div class="mt-2">
          Cargando datos...
        </div>
      </td>
    </tr>
    <tr
      v-for="(item, index) in items"
      v-else
      :key="index"
    >
      <td
        v-for="column in columns"
        :key="column.key"
        :class="[
          column.align ? `text-${column.align}` : '',
          column.width && !/px|%|rem|em|vw|vh|auto/.test(column.width) ? column.width : '',
        ]"
        :style="column.width && /px|%|rem|em|vw|vh|auto/.test(column.width) ? { width: column.width, minWidth: column.width } : {}"
      >
        {{ column.formatter ? column.formatter(item, column.key) : item[column.key] }}
      </td>
      <td
        v-if="hasActions"
        class="text-right fixed-column"
      >
        <TableActionsComponent
          v-if="actions"
          :actions="actions"
          :item="item"
        />
      </td>
    </tr>
    <tr v-if="!loading && items.length === 0">
      <td
        :colspan="hasActions ? columns.length + 1 : columns.length"
        class="text-center"
      >
        {{ emptyMessage }}
      </td>
    </tr>
  </tbody>
</template>

<style scoped>
.fixed-column {
  position: sticky !important;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  box-shadow: -2px 0 4px rgba(0, 0, 0, 10%);
  inset-inline-end: 0;
}
</style>
