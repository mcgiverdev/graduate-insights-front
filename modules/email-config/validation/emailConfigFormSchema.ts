import * as yup from 'yup'

export const emailConfigFormSchema = (isEditing: boolean) => yup.object({
  apiKey: isEditing
    ? yup.string().trim().optional()
    : yup.string().trim().required('El API Key es obligatorio'),
  emailRemitente: yup
    .string()
    .trim()
    .email('Ingrese un correo válido')
    .required('El email remitente es obligatorio'),
  nombreRemitente: yup
    .string()
    .trim()
    .required('El nombre remitente es obligatorio'),
})
