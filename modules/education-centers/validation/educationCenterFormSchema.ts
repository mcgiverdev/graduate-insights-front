import * as yup from 'yup'

export const educationCenterFormSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
  direccion: yup.string().trim().required('La dirección es obligatoria'),
})
