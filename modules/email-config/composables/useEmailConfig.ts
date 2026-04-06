import { onMounted, ref } from 'vue'
import { emailConfigService } from '../services/EmailConfigService'
import { toPayload } from '../utils/mappers'
import type { EmailConfig, EmailConfigFormValues } from '../types'
import { useSnackbar } from '@/composables/useSnackbar'

export const useEmailConfig = () => {
  const { showSnackbar } = useSnackbar()

  const config = ref<EmailConfig | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const sendingTest = ref(false)

  const fetchConfig = async () => {
    loading.value = true
    try {
      config.value = await emailConfigService.fetchConfig()
    }
    catch (error: any) {
      showSnackbar({ text: 'No se pudo cargar la configuración de email', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const saveConfig = async (values: EmailConfigFormValues): Promise<boolean> => {
    saving.value = true
    try {
      const payload = toPayload(values)

      config.value = await emailConfigService.saveConfig(payload)

      return true
    }
    catch (error: any) {
      showSnackbar({ text: error?.message ?? 'Error al guardar la configuración', color: 'error' })

      return false
    }
    finally {
      saving.value = false
    }
  }

  const sendTestEmail = async (email: string): Promise<boolean> => {
    sendingTest.value = true
    try {
      await emailConfigService.sendTestEmail(email)

      return true
    }
    catch (error: any) {
      showSnackbar({ text: error?.message ?? 'Error al enviar el email de prueba', color: 'error' })

      return false
    }
    finally {
      sendingTest.value = false
    }
  }

  onMounted(fetchConfig)

  return {
    config,
    loading,
    saving,
    sendingTest,
    fetchConfig,
    saveConfig,
    sendTestEmail,
  }
}
