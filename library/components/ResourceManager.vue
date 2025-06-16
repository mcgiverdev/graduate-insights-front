<script setup lang="ts">
import { ref, watch } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import FormGenerator from '@/library/components/FormGenerator.vue'
import TableGenerator from '@/library/components/TableGenerator.vue'
import type { BaseModel } from '@/library/models/BaseModel'
import { useGenericRepository } from '@/library/repository/GenericRepository'

interface Props {
  modelDefinition: BaseModel
  title?: string
  createButtonText?: string
  deleteConfirmTitle?: string
  deleteConfirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  createButtonText: 'Nuevo registro',
  deleteConfirmTitle: 'Confirmar eliminación',
  deleteConfirmText: '¿Estás seguro que deseas eliminar este registro? Esta acción no se puede deshacer.',
})

const itemsPerPage = ref(10)
const page = ref(1)
const hasMorePages = ref(false)

const {
  items,
  totalItems,
  loadingList,
  fetchItems,
  getItem,
  addItem,
  updateItem,
  deleteItem,
} = useGenericRepository(props.modelDefinition)

const isFormVisible = ref(false)
const itemToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const itemToDelete = ref<number | null>(null)

// Observar cambios en la paginación
watch([page, itemsPerPage], () => {
  fetchItems({ page: page.value, size: itemsPerPage.value })
  hasMorePages.value = totalItems.value > page.value * itemsPerPage.value
}, { immediate: true })

const openAddForm = () => {
  itemToEdit.value = null
  isFormVisible.value = true
}

const openEditForm = async (id: number) => {
  try {
    const item = await getItem(id)

    itemToEdit.value = item || null
    isFormVisible.value = true
  }
  catch (error) {
    snackbarMessage.value = 'Error al cargar el registro'
    isSnackbarVisible.value = true
  }
}

const confirmDelete = (item: any) => {
  // Asumimos que el ID del item está en una propiedad que termina en _id
  const idKey = Object.keys(item).find(key => key.endsWith('_id'))
  if (idKey) {
    itemToDelete.value = item[idKey]
    isConfirmDialogVisible.value = true
  }
}

const handleDelete = async () => {
  if (!itemToDelete.value)
    return

  const result = await deleteItem(itemToDelete.value)

  snackbarMessage.value = result.message
  isSnackbarVisible.value = true

  if (result.success)
    fetchItems({ page: page.value, size: itemsPerPage.value })

  isConfirmDialogVisible.value = false
  itemToDelete.value = null
}

const handleSubmit = async (data: any) => {
  try {
    if (itemToEdit.value) {
      // Asumimos que el ID del item está en una propiedad que termina en _id
      const idKey = Object.keys(itemToEdit.value).find(key => key.endsWith('_id'))
      if (idKey) {
        await updateItem(itemToEdit.value[idKey], data)
        snackbarMessage.value = `${props.modelDefinition.name} actualizado exitosamente`
      }
    }
    else {
      await addItem(data)
      snackbarMessage.value = `${props.modelDefinition.name} creado exitosamente`
    }

    isSnackbarVisible.value = true
    isFormVisible.value = false
    fetchItems({ page: page.value, size: itemsPerPage.value })
  }
  catch (error: any) {
    snackbarMessage.value = error.message || 'Error al procesar la operación'
    isSnackbarVisible.value = true
  }
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ title || `Administración de ${modelDefinition.name}` }}</VCardTitle>
      </VCardItem>
      <VDivider />
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'Todos' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />
        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <VBtn
            prepend-icon="tabler-plus"
            color="primary"
            @click="openAddForm"
          >
            {{ createButtonText }}
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- Tabla usando nuestro generador -->
      <TableGenerator
        :model-definition="modelDefinition"
        :items="items"
        :loading="loadingList"
        :current-page="page"
        :has-more-pages="hasMorePages"
        @edit="openEditForm"
        @delete="confirmDelete"
        @page-change="page = $event"
      />

      <!-- Formulario usando nuestro generador -->
      <VDialog
        v-model="isFormVisible"
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            {{ itemToEdit ? 'Editar' : 'Nuevo' }} {{ modelDefinition.name }}
          </VCardTitle>
          <VCardText>
            <FormGenerator
              :model-definition="modelDefinition"
              :initial-data="itemToEdit"
              :mode="itemToEdit ? 'edit' : 'create'"
              @submit="handleSubmit"
              @cancel="isFormVisible = false"
            />
          </VCardText>
        </VCard>
      </VDialog>

      <VSnackbar v-model="isSnackbarVisible">
        {{ snackbarMessage }}
      </VSnackbar>

      <VConfirmDialog
        v-model="isConfirmDialogVisible"
        :title="deleteConfirmTitle"
        :text="deleteConfirmText"
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDelete"
      />
    </VCard>
  </section>
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
