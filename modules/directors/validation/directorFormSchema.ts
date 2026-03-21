import * as yup from 'yup'

const dniRegex = /^\d{8}$/
const phoneRegex = /^9\d{8}$/

export const directorFormSchema = yup.object({
  nombres: yup.string().trim().required('El nombre es obligatorio'),
  apellidos: yup.string().trim().required('El apellido es obligatorio'),
  fechaNacimiento: yup.string().required('La fecha de nacimiento es obligatoria'),
  genero: yup.mixed().oneOf(['M', 'F']).required('Seleccione un género'),
  correo: yup.string().trim().email('Ingrese un correo válido').required('El correo es obligatorio'),
  dni: yup.string().matches(dniRegex, 'El DNI debe tener 8 dígitos').required('El DNI es obligatorio'),
  celular: yup
    .string()
    .matches(phoneRegex, 'El celular debe iniciar con 9 y tener 9 dígitos')
    .required('El celular es obligatorio'),
  contrasena: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
})
