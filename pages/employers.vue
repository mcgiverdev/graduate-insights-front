<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import EmployerFormDialog from '@/modules/employers/components/EmployerFormDialog.vue'
import EmployerTable from '@/modules/employers/components/EmployerTable.vue'
import { useEmployerForm } from '@/modules/employers/composables/useEmployerForm'
import { useEmployerList } from '@/modules/employers/composables/useEmployerList'
import type { Employer, EmployerFormValues } from '@/modules/employers/types'
import { toPayload } from '@/modules/employers/utils/mappers'
import { employerService } from '@/modules/employers/services/EmployerService'

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

const isFormVisible = ref(false)
const selectedEmployer = ref<Employer | null>(null)
const isConfirmVisible = ref(false)
const employerIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const openCreateForm = () => {
  selectedEmployer.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (employerId: number) => {
  clearServerErrors()
  selectedEmployer.value = null
  isFormVisible.value = true

  try {
    const employer = await employerService.getById(employerId)

    if (!employer) {
      showSnackbar({ text: 'No se encontró el empleador seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedEmployer.value = employer
  }
  catch (error) {
    console.error('Error al obtener empleador', error)
    showSnackbar({ text: 'No se pudo cargar el empleador', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: EmployerFormValues) => {
  const payload = toPayload(values)
  const result = await saveEmployer(payload, selectedEmployer.value?.employerId)

  if (result.success) {
    isFormVisible.value = false
    selectedEmployer.value = null
    await fetchEmployers()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedEmployer.value = null
}

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
