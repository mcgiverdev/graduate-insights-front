import * as yup from 'yup'

export const myJobFormSchema = yup.object({
  compania: yup.string().trim().required('La compañía es obligatoria'),
  cargo: yup.string().trim().required('El cargo es obligatorio'),
  modalidad: yup.mixed<'Presencial' | 'Remoto' | 'Híbrido'>()
    .oneOf(['Presencial', 'Remoto', 'Híbrido'])
    .required('Seleccione una modalidad'),
  fechaInicio: yup.string().required('La fecha de inicio es obligatoria'),
  fechaFin: yup.string(),
  estado: yup.mixed<'0' | '1'>().oneOf(['0', '1']).required('Seleccione un estado'),
})
