import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { graduateService } from '../services/GraduateService'
import type { Graduate, GraduateFormValues, GraduatePayload } from '../types'
import { toPayload } from '../utils/mappers'

interface UseGraduateEditorOptions {
  fetchGraduates: () => Promise<void>
  saveGraduate: (payload: GraduatePayload, graduateId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useGraduateEditor = ({
  fetchGraduates,
  saveGraduate,
  clearServerErrors,
}: UseGraduateEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedGraduate = ref<Graduate | null>(null)
  const { showSnackbar } = useSnackbar()

  const openCreateForm = () => {
    selectedGraduate.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (graduateId: number) => {
    clearServerErrors()
    selectedGraduate.value = null
    isFormVisible.value = true

    try {
      const graduate = await graduateService.getById(graduateId)

      if (!graduate) {
        showSnackbar({ text: 'No se encontró el graduado seleccionado', color: 'error' })
        isFormVisible.value = false
        return
      }

      selectedGraduate.value = graduate
    }
    catch (error) {
      console.error('Error al obtener el graduado', error)
      showSnackbar({ text: 'No se pudo cargar el graduado', color: 'error' })
      isFormVisible.value = false
    }
  }

  const handleFormSubmit = async (values: GraduateFormValues) => {
    const payload = toPayload(values)
    const result = await saveGraduate(payload, selectedGraduate.value?.graduateId)

    if (result.success) {
      isFormVisible.value = false
      selectedGraduate.value = null
      await fetchGraduates()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedGraduate.value = null
  }

  return {
    isFormVisible,
    selectedGraduate,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
