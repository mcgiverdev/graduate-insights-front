<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddGraduateDialog from '@/components/dialogs/AddGraduateDialog.vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import { useGraduateService } from '@/composables/useGraduateService'
import { DataTable } from '@/librerias/tables'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { graduates, totalGraduates, loadingList, fetchGraduates, getGraduate, deleteGraduate } = useGraduateService()

const paginatedGraduates = computed(() => graduates.value)

const isAddGraduateDialogVisible = ref(false)
const graduateToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const graduateToDelete = ref<number | null>(null)

const columns = [
  { key: 'dni', label: 'DNI' },
  { key: 'nombres', label: 'Nombre', formatter: (item: any) => `${item.nombres} ${item.apellidos}`, width: '150px' },
  { key: 'correo', label: 'Correo' },
  {
    key: 'genero',
    label: 'Género',
    formatter: (item: any) => item.genero === 'M' ? 'Masculino' : item.genero === 'F' ? 'Femenino' : item.genero,
  },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', width: '100px' },
  { key: 'celular', label: 'Celular' },
  { key: 'fecha_inicio', label: 'Fecha inicio', width: '120px' },
  { key: 'fecha_fin', label: 'Fecha fin', width: '120px' },
  { key: 'cv', label: 'CV' },
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
  fetchGraduates(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchGraduates(page.value, itemsPerPage.value)
})

const openAddGraduateDialog = () => {
  graduateToEdit.value = null
  isAddGraduateDialogVisible.value = true
}

const openEditGraduateDialog = async (id: number) => {
  const graduate = await getGraduate(id)

  graduateToEdit.value = graduate
  isAddGraduateDialogVisible.value = true
}

const confirmDelete = (item: any) => {
  graduateToDelete.value = item.graduate_id
  isConfirmDialogVisible.value = true
}

const handleDeleteGraduate = async () => {
  if (!graduateToDelete.value)
    return

  const result = await deleteGraduate(graduateToDelete.value)

  if (result.success) {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
    fetchGraduates(page.value, itemsPerPage.value)
  }
  else {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
  }

  isConfirmDialogVisible.value = false
  graduateToDelete.value = null
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Administración de Graduados</VCardTitle>
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
            @click="openAddGraduateDialog"
          >
            Nuevo graduado
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <DataTable
        :columns="columns"
        :items="paginatedGraduates"
        :loading="loadingList"
        :actions="{
          edit: (item) => openEditGraduateDialog(item.graduate_id),
          delete: confirmDelete,
        }"
      />
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalGraduates"
        @update:page="handlePageChange"
      />
      <AddGraduateDialog
        v-model:is-dialog-open="isAddGraduateDialogVisible"
        :graduate-to-edit="graduateToEdit"
        @success="() => { fetchGraduates(page, itemsPerPage); isAddGraduateDialogVisible = false }"
        @update:is-dialog-open="val => isAddGraduateDialogVisible = val"
      />
      <VSnackbar v-model="isSnackbarVisible">
        {{ snackbarMessage }}
      </VSnackbar>

      <VConfirmDialog
        v-model="isConfirmDialogVisible"
        title="Confirmar eliminación"
        text="¿Estás seguro que deseas eliminar este graduado? Esta acción no se puede deshacer."
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDeleteGraduate"
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
