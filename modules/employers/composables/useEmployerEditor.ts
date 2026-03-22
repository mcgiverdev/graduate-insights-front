import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { employerService } from '../services/EmployerService'
import type { Employer, EmployerFormValues, EmployerPayload } from '../types'
import { toPayload } from '../utils/mappers'

interface UseEmployerEditorOptions {
  fetchEmployers: () => Promise<void>
  saveEmployer: (payload: EmployerPayload, employerId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useEmployerEditor = ({ fetchEmployers, saveEmployer, clearServerErrors }: UseEmployerEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedEmployer = ref<Employer | null>(null)
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

  return {
    isFormVisible,
    selectedEmployer,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
