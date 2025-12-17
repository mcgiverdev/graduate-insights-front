import type {
  EducationCenter,
  EducationCenterApiResponse,
  EducationCenterFormValues,
  EducationCenterPayload,
} from '../types'

export const toEducationCenter = (center: EducationCenterApiResponse): EducationCenter => ({
  educationCenterId: center.education_center_id,
  nombre: center.nombre,
  direccion: center.direccion,
  estado: center.estado,
})

export const toFormValues = (center?: EducationCenter | null): EducationCenterFormValues => ({
  nombre: center?.nombre ?? '',
  direccion: center?.direccion ?? '',
})

export const toPayload = (values: EducationCenterFormValues): EducationCenterPayload => ({
  nombre: values.nombre.trim(),
  direccion: values.direccion.trim(),
})
