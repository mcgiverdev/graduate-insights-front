<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddEmployerDialog from '@/components/dialogs/AddEmployerDialog.vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { useEmployerService } from '@/composables/useEmployerService'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { employers, totalEmployers, loadingList, fetchEmployers, getEmployer, deleteEmployer } = useEmployerService()

const paginatedEmployers = computed(() => employers.value)

const isAddEmployerDialogVisible = ref(false)
const employerToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const employerToDelete = ref<number | null>(null)

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
  { key: 'ruc', label: 'RUC' },
  { key: 'razon_social', label: 'Razón Social' },
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
  fetchEmployers(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchEmployers(page.value, itemsPerPage.value)
})

const openAddEmployerDialog = () => {
  employerToEdit.value = null
  isAddEmployerDialogVisible.value = true
}

const openEditEmployerDialog = async (id: number) => {
  const employer = await getEmployer(id)

  employerToEdit.value = employer
  isAddEmployerDialogVisible.value = true
}

const confirmDelete = (item: any) => {
  employerToDelete.value = item.employer_id
  isConfirmDialogVisible.value = true
}

const handleDeleteEmployer = async () => {
  if (!employerToDelete.value)
    return

  const result = await deleteEmployer(employerToDelete.value)

  if (result.success) {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
    fetchEmployers(page.value, itemsPerPage.value)
  }
  else {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
  }

  isConfirmDialogVisible.value = false
  employerToDelete.value = null
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Administración de Empleadores</VCardTitle>
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
            @click="openAddEmployerDialog"
          >
            Nuevo empleador
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <DataTable
        :columns="columns"
        :items="paginatedEmployers"
        :loading="loadingList"
        :actions="{
          edit: (item) => openEditEmployerDialog(item.employer_id),
          delete: confirmDelete,
        }"
      />
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalEmployers"
        @update:page="handlePageChange"
      />
      <AddEmployerDialog
        v-model:is-dialog-open="isAddEmployerDialogVisible"
        :employer-to-edit="employerToEdit"
        @success="() => { fetchEmployers(page, itemsPerPage); isAddEmployerDialogVisible = false }"
        @update:is-dialog-open="val => isAddEmployerDialogVisible = val"
      />
      <VSnackbar v-model="isSnackbarVisible">
        {{ snackbarMessage }}
      </VSnackbar>

      <VConfirmDialog
        v-model="isConfirmDialogVisible"
        title="Confirmar eliminación"
        text="¿Estás seguro que deseas eliminar este empleador? Esta acción no se puede deshacer."
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDeleteEmployer"
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
