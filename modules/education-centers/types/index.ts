export interface EducationCenter {
  educationCenterId: number
  nombre: string
  direccion: string
  estado: string
}

export interface EducationCenterFilters {
  page?: number
  size?: number
  search?: string
}

export interface EducationCenterFormValues {
  nombre: string
  direccion: string
}

export interface EducationCenterPayload {
  nombre: string
  direccion: string
}

export interface EducationCenterApiResponse {
  education_center_id: number
  nombre: string
  direccion: string
  estado: string
}
