import { ref } from 'vue'
import { educationCenterService } from '../services/EducationCenterService'
import type {
  EducationCenter,
  EducationCenterFormValues,
  EducationCenterPayload,
} from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'
import { useSnackbar } from '@/composables/useSnackbar'

interface UseEducationCenterEditorOptions {
  fetchEducationCenters: () => Promise<void>
  saveEducationCenter: (payload: EducationCenterPayload, educationCenterId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useEducationCenterEditor = ({
  fetchEducationCenters,
  saveEducationCenter,
  clearServerErrors,
}: UseEducationCenterEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedEducationCenter = ref<EducationCenter | null>(null)
  const { showSnackbar } = useSnackbar()

  const openCreateForm = () => {
    selectedEducationCenter.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (educationCenterId: number) => {
    clearServerErrors()
    selectedEducationCenter.value = null
    isFormVisible.value = true

    try {
      const center = await educationCenterService.getById(educationCenterId)

      if (!center) {
        showSnackbar({ text: 'No se encontró el centro educativo seleccionado', color: 'error' })
        isFormVisible.value = false

        return
      }

      selectedEducationCenter.value = center
    }
    catch (error) {
      console.error('Error al obtener centro educativo', error)
      showSnackbar({ text: 'No se pudo cargar el centro educativo', color: 'error' })
      isFormVisible.value = false
    }
  }

  const handleFormSubmit = async (values: EducationCenterFormValues) => {
    const payload = toPayload(values)
    const result = await saveEducationCenter(payload, selectedEducationCenter.value?.educationCenterId)

    if (result.success) {
      isFormVisible.value = false
      selectedEducationCenter.value = null
      await fetchEducationCenters()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedEducationCenter.value = null
  }

  return {
    isFormVisible,
    selectedEducationCenter,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
