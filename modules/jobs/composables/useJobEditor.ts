import { ref } from 'vue'
import { jobService } from '../services/JobService'
import type { Job, JobFormValues, JobPayload } from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'
import { useSnackbar } from '@/composables/useSnackbar'

interface UseJobEditorOptions {
  fetchJobs: () => Promise<void>
  saveJob: (payload: JobPayload, jobId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
  graduateOptionsCount: () => number
  loadOptions: () => Promise<void>
}

export const useJobEditor = ({
  fetchJobs,
  saveJob,
  clearServerErrors,
  graduateOptionsCount,
  loadOptions,
}: UseJobEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedJob = ref<Job | null>(null)
  const { showSnackbar } = useSnackbar()

  const ensureOptionsLoaded = async () => {
    if (!graduateOptionsCount())
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

  return {
    isFormVisible,
    selectedJob,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
