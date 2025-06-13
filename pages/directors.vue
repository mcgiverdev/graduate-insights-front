<script setup lang="ts">
import { ref, watch } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import type { Director } from '@/composables/useDirectorService'
import FormGenerator from '@/library/components/FormGenerator.vue'
import TableGenerator from '@/library/components/TableGenerator.vue'
import { DirectorModel } from '@/library/models/DirectorModel'
import { useGenericRepository } from '@/library/repository/GenericRepository'

const itemsPerPage = ref(10)
const page = ref(1)
const hasMorePages = ref(false)

const {
  items: directors,
  totalItems: totalDirectors,
  loadingList,
  fetchItems,
  getItem,
  addItem,
  updateItem,
  deleteItem,
} = useGenericRepository<Director>(DirectorModel)

const isFormVisible = ref(false)
const directorToEdit = ref<Director | null>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const directorToDelete = ref<number | null>(null)

watch([page, itemsPerPage], () => {
  fetchItems({ page: page.value, size: itemsPerPage.value })
  hasMorePages.value = totalDirectors.value > page.value * itemsPerPage.value
}, { immediate: true })

const openAddForm = () => {
  directorToEdit.value = null
  isFormVisible.value = true
}

const openEditForm = async (id: number) => {
  try {
    const director = await getItem(id)

    directorToEdit.value = director || null
    isFormVisible.value = true
  }
  catch (error) {
    snackbarMessage.value = 'Error al cargar el director'
    isSnackbarVisible.value = true
  }
}

const confirmDelete = (item: Director) => {
  directorToDelete.value = item.director_id
  isConfirmDialogVisible.value = true
}

const handleDeleteDirector = async () => {
  if (!directorToDelete.value)
    return

  const result = await deleteItem(directorToDelete.value)

  snackbarMessage.value = result.message
  isSnackbarVisible.value = true

  if (result.success)
    fetchItems({ page: page.value, size: itemsPerPage.value })

  isConfirmDialogVisible.value = false
  directorToDelete.value = null
}

const handleSubmit = async (data: Partial<Director>) => {
  try {
    if (directorToEdit.value) {
      // Actualización
      await updateItem(directorToEdit.value.director_id, data)
      snackbarMessage.value = `${DirectorModel.name} actualizado exitosamente`
    }
    else {
      // Creación
      await addItem(data)
      snackbarMessage.value = `${DirectorModel.name} creado exitosamente`
    }

    // Si llegamos aquí, la operación fue exitosa
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
        <VCardTitle>Administración de Directores</VCardTitle>
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
            Nuevo director
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- Tabla usando nuestro generador -->
      <TableGenerator
        :model-definition="DirectorModel"
        :items="directors"
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
            {{ directorToEdit ? 'Editar' : 'Nuevo' }} Director
          </VCardTitle>
          <VCardText>
            <FormGenerator
              :model-definition="DirectorModel"
              :initial-data="directorToEdit"
              :mode="directorToEdit ? 'edit' : 'create'"
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
        title="Confirmar eliminación"
        text="¿Estás seguro que deseas eliminar este director? Esta acción no se puede deshacer."
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDeleteDirector"
      />
    </VCard>
  </section>
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
