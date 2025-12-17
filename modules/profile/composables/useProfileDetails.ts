import { computed, reactive, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useUser } from '@/composables/useUser'
import type { RequestResult } from '@/infrastructure/http/types'
import { profileService } from '../services/ProfileService'
import type { Profile, ProfileFormValues } from '../types'
import { toFormValues, toPayload } from '../utils/mappers'

const cloneFormValues = (values: ProfileFormValues) => ({ ...values })

export const useProfileDetails = () => {
  const { user, fetchUser } = useUser()
  const form = reactive<ProfileFormValues>(toFormValues())
  const loading = ref(false)
  const saving = ref(false)
  const serverErrors = ref<Record<string, string>>({})
  const currentProfile = ref<Profile | null>(null)
  const initialSnapshot = ref<ProfileFormValues | null>(null)
  const { showSnackbar } = useSnackbar()

  const hydrateForm = (profile: Profile | null) => {
    const values = toFormValues(profile)
    Object.assign(form, values)
    initialSnapshot.value = cloneFormValues(values)
  }

  const loadProfile = async () => {
    if (!user.value?.id)
      return

    loading.value = true
    try {
      const profile = await profileService.fetchById(user.value.id)
      currentProfile.value = profile
      hydrateForm(profile)
    }
    catch (error: any) {
      console.error('No se pudo cargar el perfil', error)
      showSnackbar({ text: error?.data?.message || 'No se pudo cargar el perfil', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const isDirty = computed(() => {
    if (!initialSnapshot.value)
      return false

    return JSON.stringify(form) !== JSON.stringify(initialSnapshot.value)
  })

  const resetForm = () => {
    if (!initialSnapshot.value)
      return

    Object.assign(form, cloneFormValues(initialSnapshot.value))
  }

  const submit = async (): Promise<RequestResult> => {
    if (!currentProfile.value)
      await loadProfile()

    if (!currentProfile.value)
      return { success: false, message: 'Perfil no disponible' }

    saving.value = true
    serverErrors.value = {}

    try {
      const payload = toPayload(form, currentProfile.value.contrasena ?? '')
      await profileService.update(currentProfile.value.userId, payload)

      currentProfile.value = {
        ...currentProfile.value,
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        dni: form.dni,
        celular: form.celular,
        genero: form.genero,
        fechaNacimiento: form.fechaNacimiento || null,
      }

      hydrateForm(currentProfile.value)
      await fetchUser()
      showSnackbar({ text: 'Perfil actualizado correctamente', color: 'success' })
      return { success: true }
    }
    catch (error: any) {
      const apiErrors = error?.data?.errors
      if (apiErrors) {
        const normalized: Record<string, string> = {}
        Object.entries(apiErrors).forEach(([field, message]) => {
          normalized[field] = Array.isArray(message) ? message.join(', ') : String(message)
        })
        serverErrors.value = normalized
        return { success: false, message: error?.data?.message }
      }

      const fallbackMessage = error?.data?.message || 'No se pudo actualizar el perfil'
      showSnackbar({ text: fallbackMessage, color: 'error' })
      return { success: false, message: fallbackMessage }
    }
    finally {
      saving.value = false
    }
  }

  const initialize = async () => {
    if (!user.value)
      await fetchUser()

    await loadProfile()
  }

  return {
    form,
    loading,
    saving,
    serverErrors,
    isDirty,
    initialize,
    submit,
    resetForm,
  }
}
