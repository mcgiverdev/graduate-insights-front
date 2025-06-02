<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  label: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string
  formatter?: (item: any, key: string) => string
}

interface Props {
  columns: Column[]
  items: any[]
  loading?: boolean
  emptyMessage?: string
  actions?: {
    edit?: (item: any) => void
    delete?: (item: any) => void
    custom?: Array<{
      icon: string
      color: string
      onClick: (item: any) => void
    }>
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No hay datos para mostrar.',
  actions: () => ({}),
})

const hasActions = computed(() => {
  return props.actions?.edit || props.actions?.delete || (props.actions?.custom && props.actions.custom.length > 0)
})
</script>

<template>
  <div class="table-container">
    <VTable class="mb-4">
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
            <div class="d-flex align-center justify-end">
              <VBtn
                v-if="actions?.edit"
                icon
                size="small"
                color="primary"
                @click="actions.edit(item)"
              >
                <VIcon icon="tabler-edit" />
              </VBtn>
              <VBtn
                v-if="actions?.delete"
                icon
                size="small"
                color="error"
                class="ms-2"
                @click="actions.delete(item)"
              >
                <VIcon icon="tabler-trash" />
              </VBtn>
              <template v-if="actions?.custom">
                <VBtn
                  v-for="(action, actionIndex) in actions.custom"
                  :key="actionIndex"
                  icon
                  size="small"
                  :color="action.color"
                  class="ms-2"
                  @click="action.onClick(item)"
                >
                  <VIcon :icon="action.icon" />
                </VBtn>
              </template>
            </div>
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
    </VTable>
  </div>
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
