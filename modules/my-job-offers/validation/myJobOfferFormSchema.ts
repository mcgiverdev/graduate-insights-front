import * as yup from 'yup'

export const myJobOfferFormSchema = yup.object({
  titulo: yup.string().trim().required('El título es obligatorio'),
  link: yup.string().trim().url('Ingrese un enlace válido').required('El enlace es obligatorio'),
  descripcion: yup.string().trim().required('La descripción es obligatoria'),
})
