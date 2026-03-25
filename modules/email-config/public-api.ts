export { default as EmailConfigForm } from './components/EmailConfigForm.vue'
export { default as EmailTestDialog } from './components/EmailTestDialog.vue'

export { useEmailConfig } from './composables/useEmailConfig'

export { emailConfigService } from './services/EmailConfigService'

export type {
  EmailConfig,
  EmailConfigApiResponse,
  EmailConfigFormValues,
  EmailConfigPayload,
} from './types'
