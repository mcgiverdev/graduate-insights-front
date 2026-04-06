<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  EmployerFormDialog,
  EmployerTable,
  useEmployerEditor,
  useEmployerForm,
  useEmployerList,
} from '@/src/features/employers'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

const {
  items,
  loading,
  search,
  pagination,
  setPage,
  setItemsPerPage,
  setSearch,
  deleteEmployer,
  fetchEmployers,
} = useEmployerList()

const { submitting, serverErrors, saveEmployer, clearServerErrors } = useEmployerForm()

const isConfirmVisible = ref(false)
const employerIdToDelete = ref<number | null>(null)

const {
  isFormVisible,
  selectedEmployer,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useEmployerEditor({
  fetchEmployers,
  saveEmployer,
  clearServerErrors,
})

const requestDelete = (employerId: number) => {
  employerIdToDelete.value = employerId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (employerIdToDelete.value === null)
    return

  await deleteEmployer(employerIdToDelete.value)
  isConfirmVisible.value = false
  employerIdToDelete.value = null
}
</script>

<template>
  <section>
    <EmployerTable
      :items="items"
      :loading="loading"
      :page="pagination.page"
      :items-per-page="pagination.itemsPerPage"
      :total-items="pagination.totalItems"
      :search="search"
      @update:page="setPage"
      @update:items-per-page="setItemsPerPage"
      @update:search="setSearch"
      @create="openCreateForm"
      @edit="openEditForm"
      @delete="requestDelete"
    />

    <EmployerFormDialog
      v-model="isFormVisible"
      :employer="selectedEmployer"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar empleador"
      text="¿Seguro que deseas eliminar este empleador? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
