import { ref } from 'vue'
import { directorService } from '../services/DirectorService'
import type { Director, DirectorFormValues, DirectorPayload } from '../types'
import { toPayload } from '../utils/mappers'
import type { RequestResult } from '@/infrastructure/http/types'
import { useSnackbar } from '@/composables/useSnackbar'

interface UseDirectorEditorOptions {
  fetchDirectors: () => Promise<void>
  saveDirector: (payload: DirectorPayload, directorId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useDirectorEditor = ({ fetchDirectors, saveDirector, clearServerErrors }: UseDirectorEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedDirector = ref<Director | null>(null)
  const { showSnackbar } = useSnackbar()

  const openCreateForm = () => {
    selectedDirector.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (directorId: number) => {
    clearServerErrors()
    selectedDirector.value = null
    isFormVisible.value = true

    try {
      const director = await directorService.getById(directorId)

      if (!director) {
        showSnackbar({ text: 'No se encontró el director seleccionado', color: 'error' })
        isFormVisible.value = false

        return
      }

      selectedDirector.value = director
    }
    catch (error) {
      console.error('Error al obtener director', error)
      showSnackbar({ text: 'No se pudo cargar el director', color: 'error' })
      isFormVisible.value = false
    }
  }

  const handleFormSubmit = async (values: DirectorFormValues) => {
    const payload = toPayload(values)
    const result = await saveDirector(payload, selectedDirector.value?.directorId)

    if (result.success) {
      isFormVisible.value = false
      selectedDirector.value = null
      await fetchDirectors()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedDirector.value = null
  }

  return {
    isFormVisible,
    selectedDirector,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
