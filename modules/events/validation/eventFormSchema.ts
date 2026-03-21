import * as yup from 'yup'

export const eventFormSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
  contenido: yup.string().trim().required('El contenido es obligatorio'),
  estado: yup.mixed<'0' | '1'>().oneOf(['0', '1']).required('Seleccione un estado'),
  directorId: yup
    .number()
    .typeError('Seleccione un director')
    .required('El director es obligatorio'),
  eventTypeId: yup
    .number()
    .typeError('Seleccione un tipo de evento')
    .required('El tipo de evento es obligatorio'),
})
