export interface EmailConfigApiResponse {
  id: number
  proveedor: string
  email_remitente: string
  nombre_remitente: string
  activo: boolean
}

export interface EmailConfig {
  id: number
  proveedor: string
  emailRemitente: string
  nombreRemitente: string
  activo: boolean
}

export interface EmailConfigFormValues {
  apiKey: string
  emailRemitente: string
  nombreRemitente: string
}

export interface EmailConfigPayload {
  api_key: string
  email_remitente: string
  nombre_remitente: string
}
