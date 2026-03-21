<script setup lang="ts">
import type { Column } from '../types'

interface Props {
  columns: Column[]
  hasActions: boolean
}

defineProps<Props>()
</script>

<template>
  <thead>
    <tr>
      <th
        v-for="column in columns"
        :key="column.key"
        :class="[
          column.align ? `text-${column.align}` : '',
          column.width && !/px|%|rem|em|vw|vh|auto/.test(column.width) ? column.width : '',
        ]"
        :style="column.width && /px|%|rem|em|vw|vh|auto/.test(column.width) ? { width: column.width, minWidth: column.width } : {}"
      >
        {{ column.label }}
      </th>
      <th
        v-if="hasActions"
        class="text-right fixed-column"
      >
        Acciones
      </th>
    </tr>
  </thead>
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
