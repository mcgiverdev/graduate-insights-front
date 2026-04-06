import { ref } from 'vue'
import { myJobService } from '../services/MyJobService'
import type { MyJob, MyJobFormValues, MyJobPayload } from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'
import { useSnackbar } from '@/composables/useSnackbar'

interface UseMyJobEditorOptions {
  fetchMyJobs: () => Promise<void>
  saveMyJob: (payload: MyJobPayload, jobId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useMyJobEditor = ({
  fetchMyJobs,
  saveMyJob,
  clearServerErrors,
}: UseMyJobEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedJob = ref<MyJob | null>(null)
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

  return {
    isFormVisible,
    selectedJob,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
