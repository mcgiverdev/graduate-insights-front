<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  MyJobFormDialog,
  MyJobTable,
  useMyJobEditor,
  useMyJobForm,
  useMyJobList,
} from '@/src/features/my-jobs'

definePageMeta({
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
  deleteMyJob,
  fetchMyJobs,
} = useMyJobList()

const { submitting, serverErrors, saveMyJob, clearServerErrors } = useMyJobForm()

const isConfirmVisible = ref(false)
const jobIdToDelete = ref<number | null>(null)

const {
  isFormVisible,
  selectedJob,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useMyJobEditor({
  fetchMyJobs,
  saveMyJob,
  clearServerErrors,
})

const requestDelete = (jobId: number) => {
  jobIdToDelete.value = jobId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (jobIdToDelete.value === null)
    return

  await deleteMyJob(jobIdToDelete.value)
  isConfirmVisible.value = false
  jobIdToDelete.value = null
}
</script>

<template>
  <section>
    <MyJobTable
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

    <MyJobFormDialog
      v-model="isFormVisible"
      :job="selectedJob"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar trabajo"
      text="¿Seguro que deseas eliminar este trabajo? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
