import type {
  EmailConfig,
  EmailConfigApiResponse,
  EmailConfigFormValues,
  EmailConfigPayload,
} from '../types'

export const toEmailConfig = (api: EmailConfigApiResponse): EmailConfig => ({
  id: api.id,
  proveedor: api.proveedor,
  emailRemitente: api.email_remitente,
  nombreRemitente: api.nombre_remitente,
  activo: api.activo,
})

export const toFormValues = (config?: EmailConfig | null): EmailConfigFormValues => ({
  apiKey: '',
  emailRemitente: config?.emailRemitente ?? '',
  nombreRemitente: config?.nombreRemitente ?? '',
})

export const toPayload = (values: EmailConfigFormValues): EmailConfigPayload => ({
  api_key: values.apiKey.trim(),
  email_remitente: values.emailRemitente.trim(),
  nombre_remitente: values.nombreRemitente.trim(),
})
