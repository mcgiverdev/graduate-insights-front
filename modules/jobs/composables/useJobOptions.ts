import { onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { keyValueService } from '@/modules/shared/services/KeyValueService'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

const GRADUATE_ENDPOINT = '/graduate-insights/v1/api/graduate/list'

export const useJobOptions = () => {
  const graduateOptions = ref<KeyValueOption[]>([])
  const loadingOptions = ref(false)
  const { showSnackbar } = useSnackbar()

  const loadOptions = async () => {
    loadingOptions.value = true
    try {
      graduateOptions.value = await keyValueService.fetch(GRADUATE_ENDPOINT)
    }
    catch (error) {
      console.error('Error al cargar graduados:', error)
      showSnackbar({ text: 'No se pudieron cargar los graduados', color: 'error' })
    }
    finally {
      loadingOptions.value = false
    }
  }

  onMounted(() => {
    if (!graduateOptions.value.length)
      loadOptions()
  })

  return {
    graduateOptions,
    loadingOptions,
    loadOptions,
  }
}
