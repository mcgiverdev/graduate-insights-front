import { onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { keyValueService } from '@/modules/shared/services/KeyValueService'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

const EMPLOYER_ENDPOINT = '/graduate-insights/v1/api/employer/list'

export const useJobOfferOptions = () => {
  const employerOptions = ref<KeyValueOption[]>([])
  const loadingOptions = ref(false)
  const { showSnackbar } = useSnackbar()

  const loadOptions = async () => {
    loadingOptions.value = true
    try {
      employerOptions.value = await keyValueService.fetch(EMPLOYER_ENDPOINT)
    }
    catch (error) {
      console.error('Error al cargar empleadores:', error)
      showSnackbar({ text: 'No se pudieron cargar los empleadores', color: 'error' })
    }
    finally {
      loadingOptions.value = false
    }
  }

  onMounted(() => {
    if (!employerOptions.value.length)
      loadOptions()
  })

  return {
    employerOptions,
    loadingOptions,
    loadOptions,
  }
}
