<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddDirectorDialog from '@/components/dialogs/AddDirectorDialog.vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import { useDirectorService } from '@/composables/useDirectorService'
import { DataTable } from '@/librerias/tables'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { directors, totalDirectors, loadingList, fetchDirectors, getDirector, deleteDirector } = useDirectorService()

const paginatedDirectors = computed(() => directors.value)

const isAddDirectorDialogVisible = ref(false)
const directorToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const directorToDelete = ref<number | null>(null)

const columns = [
  { key: 'dni', label: 'DNI' },
  { key: 'nombres', label: 'Nombre', formatter: (item: any) => `${item.nombres} ${item.apellidos}`, width: '300px' },
  { key: 'correo', label: 'Correo' },
  {
    key: 'genero',
    label: 'Género',
    formatter: (item: any) => item.genero === 'M' ? 'Masculino' : item.genero === 'F' ? 'Femenino' : item.genero,
  },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', width: '300px' },
  { key: 'celular', label: 'Celular' },
  {
    key: 'estado',
    label: 'Estado',
    formatter: (item: any) => item.estado === '1' ? 'Activo' : 'Inactivo',
  },
]

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

watch([page, itemsPerPage], () => {
  fetchDirectors(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchDirectors(page.value, itemsPerPage.value)
})

const openAddDirectorDialog = () => {
  directorToEdit.value = null
  isAddDirectorDialogVisible.value = true
}

const openEditDirectorDialog = async (id: number) => {
  const director = await getDirector(id)

  directorToEdit.value = director
  isAddDirectorDialogVisible.value = true
}

const confirmDelete = (item: any) => {
  directorToDelete.value = item.director_id
  isConfirmDialogVisible.value = true
}

const handleDeleteDirector = async () => {
  if (!directorToDelete.value)
    return

  const result = await deleteDirector(directorToDelete.value)

  if (result.success) {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
    fetchDirectors(page.value, itemsPerPage.value)
  }
  else {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
  }

  isConfirmDialogVisible.value = false
  directorToDelete.value = null
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
            @click="openAddDirectorDialog"
          >
            Nuevo director
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <DataTable
        :columns="columns"
        :items="paginatedDirectors"
        :loading="loadingList"
        :actions="{
          edit: (item) => openEditDirectorDialog(item.director_id),
          delete: confirmDelete,
        }"
      />
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalDirectors"
        @update:page="handlePageChange"
      />
      <AddDirectorDialog
        v-model:is-dialog-open="isAddDirectorDialogVisible"
        :director-to-edit="directorToEdit"
        @success="() => { fetchDirectors(page, itemsPerPage); isAddDirectorDialogVisible = false }"
        @update:is-dialog-open="val => isAddDirectorDialogVisible = val"
      />
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
