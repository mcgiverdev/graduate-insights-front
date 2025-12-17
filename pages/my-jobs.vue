<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import MyJobFormDialog from '@/modules/my-jobs/components/MyJobFormDialog.vue'
import MyJobTable from '@/modules/my-jobs/components/MyJobTable.vue'
import { useMyJobForm } from '@/modules/my-jobs/composables/useMyJobForm'
import { useMyJobList } from '@/modules/my-jobs/composables/useMyJobList'
import type { MyJob, MyJobFormValues } from '@/modules/my-jobs/types'
import { toPayload } from '@/modules/my-jobs/utils/mappers'
import { myJobService } from '@/modules/my-jobs/services/MyJobService'

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

const isFormVisible = ref(false)
const selectedJob = ref<MyJob | null>(null)
const isConfirmVisible = ref(false)
const jobIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const openCreateForm = () => {
  selectedJob.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (jobId: number) => {
  clearServerErrors()
  selectedJob.value = null
  isFormVisible.value = true

  try {
    const job = await myJobService.getById(jobId)

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

const handleFormSubmit = async (values: MyJobFormValues) => {
  const payload = toPayload(values)
  const result = await saveMyJob(payload, selectedJob.value?.jobId)

  if (result.success) {
    isFormVisible.value = false
    selectedJob.value = null
    await fetchMyJobs()
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
