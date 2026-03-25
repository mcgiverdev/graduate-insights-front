import * as yup from 'yup'

const phoneRegex = /^9\d{8}$/
const rucRegex = /^\d{11}$/

export const createEmployerFormSchema = (isEdit: boolean) => yup.object({
  nombres: yup.string().trim().required('El nombre es obligatorio'),
  apellidos: yup.string().trim().required('El apellido es obligatorio'),
  correo: yup.string().trim().email('Ingrese un correo válido').required('El correo es obligatorio'),
  celular: yup
    .string()
    .matches(phoneRegex, 'El celular debe iniciar con 9 y tener 9 dígitos')
    .required('El celular es obligatorio'),
  ruc: yup.string().matches(rucRegex, 'El RUC debe tener 11 dígitos').required('El RUC es obligatorio'),
  razonSocial: yup.string().trim().required('La razón social es obligatoria'),
  direccion: yup.string().trim().max(200, 'La dirección no debe exceder 200 caracteres').optional(),
  resumenEmpresa: yup.string().trim().max(1000, 'El resumen no debe exceder 1000 caracteres').optional(),
  contrasena: isEdit
    ? yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional().nullable()
    : yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es obligatoria'),
})
