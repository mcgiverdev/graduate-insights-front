import { type Ref, ref, watch } from 'vue'
import type { Graduate } from '../types'
import { graduateService } from '../services/GraduateService'
import { useSnackbar } from '@/composables/useSnackbar'

export const useGraduateDetail = (graduateId: Ref<number | null>) => {
  const graduate = ref<Graduate | null>(null)
  const loading = ref(false)
  const notFound = ref(false)
  const { showSnackbar } = useSnackbar()

  const fetchGraduate = async () => {
    const currentId = graduateId.value

    if (!currentId) {
      graduate.value = null
      notFound.value = true

      return
    }

    loading.value = true
    notFound.value = false

    try {
      const detail = await graduateService.getById(currentId)

      graduate.value = detail
      notFound.value = !detail
    }
    catch (error) {
      console.error('Error al cargar detalle de graduado', error)
      graduate.value = null
      notFound.value = true
      showSnackbar({ text: 'No se pudo cargar el detalle del graduado', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  watch(graduateId, () => {
    fetchGraduate()
  }, { immediate: true })

  return {
    graduate,
    loading,
    notFound,
    fetchGraduate,
  }
}
