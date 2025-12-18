import * as yup from 'yup'

export const jobOfferFormSchema = yup.object({
  titulo: yup.string().trim().required('El título es obligatorio'),
  link: yup.string().trim().url('Ingrese un enlace válido').required('El enlace es obligatorio'),
  descripcion: yup.string().trim().required('La descripción es obligatoria'),
  employerId: yup
    .number()
    .typeError('Seleccione un empleador')
    .required('El empleador es obligatorio'),
})
