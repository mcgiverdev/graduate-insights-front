<script setup lang="ts">
import { ref, watch } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import FormGenerator from '@/library/components/FormGenerator.vue'
import TableGenerator from '@/library/components/TableGenerator.vue'
import { useGenericRepository } from '@/library/repository/GenericRepository'
import type { Resource } from '@/library/resources/Resource'

interface Props {
  resource: Resource
}

const props = defineProps<Props>()

const itemsPerPage = ref(props.resource.getDefaultPerPage())
const page = ref(1)
const hasMorePages = ref(false)
const searchQuery = ref('')

const {
  items,
  totalItems,
  loadingList,
  fetchItems,
  getItem,
  addItem,
  updateItem,
  deleteItem,
} = useGenericRepository(props.resource.getModel())

const isFormVisible = ref(false)
const itemToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const itemToDelete = ref<number | null>(null)
const currentAction = ref<any>(null)

// Observar cambios en la paginación y búsqueda
watch([page, itemsPerPage, searchQuery], () => {
  const params: any = {
    page: page.value,
    size: itemsPerPage.value,
  }

  if (searchQuery.value)
    params.search = searchQuery.value

  fetchItems(params)
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
    snackbarMessage.value = `Error al cargar el ${props.resource.getSingularLabel().toLowerCase()}`
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
        snackbarMessage.value = `${props.resource.getSingularLabel()} actualizado exitosamente`
      }
    }
    else {
      await addItem(data)
      snackbarMessage.value = `${props.resource.getSingularLabel()} creado exitosamente`
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

const handleAction = async (action: any, selectedItems: any[]) => {
  if (action.confirmationRequired) {
    currentAction.value = action
    isConfirmDialogVisible.value = true

    return
  }

  try {
    await action.handler(selectedItems)
    fetchItems({ page: page.value, size: itemsPerPage.value })
  }
  catch (error: any) {
    snackbarMessage.value = error.message || 'Error al ejecutar la acción'
    isSnackbarVisible.value = true
  }
}

const executeAction = async () => {
  if (!currentAction.value)
    return

  try {
    await currentAction.value.handler(itemToDelete.value ? [itemToDelete.value] : [])
    fetchItems({ page: page.value, size: itemsPerPage.value })
  }
  catch (error: any) {
    snackbarMessage.value = error.message || 'Error al ejecutar la acción'
    isSnackbarVisible.value = true
  }
  finally {
    isConfirmDialogVisible.value = false
    currentAction.value = null
  }
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ resource.getTitle() }}</VCardTitle>
      </VCardItem>
      <VDivider />
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="resource.getPerPageOptions().map(value => ({ value, title: String(value) }))"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <div style="inline-size: 15.625rem;">
            <!-- Campo de búsqueda -->
            <AppTextField
              v-if="resource.isSearchable()"
              v-model="searchQuery"
              placeholder="Buscar..."
              prepend-inner-icon="tabler-search"
              hide-details
            />
          </div>

          <VBtn
            prepend-icon="tabler-plus"
            color="primary"
            @click="openAddForm"
          >
            Nuevo {{ resource.getSingularLabel().toLowerCase() }}
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- Tabla usando nuestro generador -->
      <TableGenerator
        :model-definition="resource.getModel()"
        :items="items"
        :loading="loadingList"
        :current-page="page"
        :has-more-pages="hasMorePages"
        :fields="resource.getIndexFields()"
        :actions="resource.getActions().filter(a => a.showOnTableRow)"
        @edit="openEditForm"
        @delete="confirmDelete"
        @action="handleAction"
        @page-change="page = $event"
      />

      <!-- Formulario usando nuestro generador -->
      <VDialog
        v-model="isFormVisible"
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            {{ itemToEdit ? 'Editar' : 'Nuevo' }} {{ resource.getSingularLabel() }}
          </VCardTitle>
          <VCardText>
            <FormGenerator
              :model-definition="resource.getModel()"
              :initial-data="itemToEdit"
              :mode="itemToEdit ? 'edit' : 'create'"
              :fields="itemToEdit ? resource.getUpdateFields() : resource.getCreateFields()"
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
        :title="currentAction?.confirmationTitle || 'Confirmar eliminación'"
        :text="currentAction?.confirmationText || `¿Estás seguro que deseas eliminar este ${resource.getSingularLabel().toLowerCase()}? Esta acción no se puede deshacer.`"
        confirm-text="Confirmar"
        cancel-text="Cancelar"
        @confirm="currentAction ? executeAction() : handleDelete()"
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
