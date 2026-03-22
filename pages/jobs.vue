<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  JobFormDialog,
  JobTable,
  useJobEditor,
  useJobForm,
  useJobList,
  useJobOptions,
} from '@/src/features/jobs'

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
  deleteJob,
  fetchJobs,
} = useJobList()

const { submitting, serverErrors, saveJob, clearServerErrors } = useJobForm()
const { graduateOptions, loadingOptions, loadOptions } = useJobOptions()

const isConfirmVisible = ref(false)
const jobIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedJob,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useJobEditor({
  fetchJobs,
  saveJob,
  clearServerErrors,
  graduateOptionsCount: () => graduateOptions.value.length,
  loadOptions,
})

const requestDelete = (jobId: number) => {
  jobIdToDelete.value = jobId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (jobIdToDelete.value === null)
    return

  await deleteJob(jobIdToDelete.value)
  isConfirmVisible.value = false
  jobIdToDelete.value = null
}
</script>

<template>
  <section>
    <JobTable
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

    <JobFormDialog
      v-model="isFormVisible"
      :job="selectedJob"
      :graduate-options="graduateOptions"
      :options-loading="loadingOptions"
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
