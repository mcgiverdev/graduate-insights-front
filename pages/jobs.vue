<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import JobFormDialog from '@/modules/jobs/components/JobFormDialog.vue'
import JobTable from '@/modules/jobs/components/JobTable.vue'
import { useJobForm } from '@/modules/jobs/composables/useJobForm'
import { useJobList } from '@/modules/jobs/composables/useJobList'
import { useJobOptions } from '@/modules/jobs/composables/useJobOptions'
import type { Job, JobFormValues } from '@/modules/jobs/types'
import { toPayload } from '@/modules/jobs/utils/mappers'
import { jobService } from '@/modules/jobs/services/JobService'

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

const isFormVisible = ref(false)
const selectedJob = ref<Job | null>(null)
const isConfirmVisible = ref(false)
const jobIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const ensureOptionsLoaded = async () => {
  if (!graduateOptions.value.length)
    await loadOptions()
}

const openCreateForm = async () => {
  await ensureOptionsLoaded()
  selectedJob.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (jobId: number) => {
  await ensureOptionsLoaded()
  clearServerErrors()
  selectedJob.value = null
  isFormVisible.value = true

  try {
    const job = await jobService.getById(jobId)

    if (!job) {
      showSnackbar({ text: 'No se encontró el trabajo seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedJob.value = job
  }
  catch (error) {
    console.error('Error al obtener trabajo', error)
    showSnackbar({ text: 'No se pudo cargar el trabajo', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: JobFormValues) => {
  const payload = toPayload(values)
  const result = await saveJob(payload, selectedJob.value?.jobId)

  if (result.success) {
    isFormVisible.value = false
    selectedJob.value = null
    await fetchJobs()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedJob.value = null
}

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
