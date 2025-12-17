import * as yup from 'yup'

export const eventTypeFormSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
})
