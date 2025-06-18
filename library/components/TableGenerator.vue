<script lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { FieldTypeRegistry } from '../types/FieldType'
import type { FieldDefinition, ModelDefinition } from '../types/ModelDefinition'

export default defineComponent({
  name: 'TableGenerator',

  props: {
    modelDefinition: {
      type: Object as PropType<ModelDefinition>,
      required: true,
    },
    items: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    hasMorePages: {
      type: Boolean,
      default: false,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['edit', 'delete', 'pageChange'],

  setup(props) {
    const visibleFields = computed(() => {
      const fields = props.modelDefinition.fields

      return Object.entries(fields).filter(([_, field]) =>
        field.list?.visible !== false,
      )
    })

    const formatValue = (value: any, field: FieldDefinition) => {
      const fieldType = FieldTypeRegistry.get(field.type)
      if (fieldType?.format)
        return fieldType.format(value)

      return value
    }

    const getItemId = (item: Record<string, any>): string | number => {
      // Primero intentamos usar el campo ID definido en el modelo
      const idField = props.modelDefinition.options?.idField
      if (idField && item[idField] !== undefined)
        return item[idField]

      // Si no hay campo ID definido o no se encuentra, intentamos con campos comunes
      const commonIdFields = ['id', 'ID', '_id', 'director_id', 'userId', 'user_id']
      for (const field of commonIdFields) {
        if (item[field] !== undefined)
          return item[field]
      }

      // Si no encontramos ningún ID, lanzamos un error
      console.error('No se pudo encontrar un ID válido para el item:', item)
      throw new Error('No se pudo encontrar un ID válido para el item')
    }

    return {
      visibleFields,
      formatValue,
      getItemId,
    }
  },
})
</script>

<template>
  <VCard class="table-card">
    <div class="table-container">
      <VTable class="data-table">
        <thead>
          <tr>
            <th
              v-for="[name, field] in visibleFields"
              :key="name"
            >
              {{ field.label }}
            </th>
            <th v-if="showActions">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="getItemId(item)"
          >
            <td
              v-for="[name, field] in visibleFields"
              :key="name"
            >
              {{ formatValue(item[name], field) }}
            </td>
            <td
              v-if="showActions"
              class="actions"
            >
              <VBtn
                size="small"
                color="primary"
                icon
                @click="$emit('edit', getItemId(item))"
              >
                <VTooltip activator="parent">
                  Editar
                </VTooltip>
                <VIcon icon="tabler-edit" />
              </VBtn>
              <VBtn
                size="small"
                color="error"
                icon
                @click="$emit('delete', item)"
              >
                <VTooltip activator="parent">
                  Eliminar
                </VTooltip>
                <VIcon icon="tabler-trash" />
              </VBtn>
            </td>
          </tr>
          <tr v-if="loading || items.length === 0">
            <td
              :colspan="visibleFields.length + (showActions ? 1 : 0)"
              class="text-center py-4"
            >
              <VProgressCircular
                v-if="loading"
                indeterminate
                color="primary"
              />
              <span v-else>
                No hay datos disponibles
              </span>
            </td>
          </tr>
        </tbody>
      </VTable>
    </div>

    <VDivider v-if="modelDefinition.options?.perPage" />

    <VCardText
      v-if="modelDefinition.options?.perPage"
      class="d-flex justify-center align-center pa-2 gap-4"
    >
      <VBtn
        :disabled="currentPage === 1"
        variant="text"
        size="small"
        @click="$emit('pageChange', currentPage - 1)"
      >
        <VIcon start>
          mdi-chevron-left
        </VIcon>
        Anterior
      </VBtn>

      <span class="text-caption">
        Página {{ currentPage }}
      </span>

      <VBtn
        :disabled="!hasMorePages"
        variant="text"
        size="small"
        @click="$emit('pageChange', currentPage + 1)"
      >
        Siguiente
        <VIcon end>
          mdi-chevron-right
        </VIcon>
      </VBtn>
    </VCardText>
  </VCard>
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
