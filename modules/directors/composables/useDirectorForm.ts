import { ref } from 'vue'
import { directorService } from '../services/DirectorService'
import type { DirectorPayload } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'

const formFields = ['nombres', 'apellidos', 'fechaNacimiento', 'genero', 'correo', 'dni', 'celular', 'contrasena']

const normalizeFieldName = (field: string): string | null => {
  if (formFields.includes(field))
    return field

  const snake = field.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (formFields.includes(snake))
    return snake

  const camel = field.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  if (formFields.includes(camel))
    return camel

  return null
}

export const useDirectorForm = () => {
  const submitting = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const { showSnackbar } = useSnackbar()

  const saveDirector = async (payload: DirectorPayload, directorId?: number): Promise<RequestResult> => {
    submitting.value = true
    serverErrors.value = {}

    try {
      if (directorId !== undefined && directorId !== null)
        await directorService.update(directorId, payload)
      else
        await directorService.create(payload)

      showSnackbar({ text: directorId !== undefined && directorId !== null ? 'Director actualizado' : 'Director creado', color: 'success' })

      return { success: true }
    }
    catch (error: any) {
      if (error?.data?.errors) {
        const mapped: Record<string, string> = {}

        Object.entries(error.data.errors).forEach(([field, message]) => {
          const normalized = normalizeFieldName(field)
          if (normalized)
            mapped[normalized] = String(message)
        })
        serverErrors.value = mapped

        return { success: false, message: error?.data?.message }
      }

      showSnackbar({ text: error?.message || 'No se pudo guardar el director', color: 'error' })

      return { success: false, message: error?.message }
    }
    finally {
      submitting.value = false
    }
  }

  const clearServerErrors = () => {
    serverErrors.value = {}
  }

  return {
    submitting,
    serverErrors,
    saveDirector,
    clearServerErrors,
  }
}
