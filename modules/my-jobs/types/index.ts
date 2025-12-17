export type MyJobStatus = '0' | '1'
export type MyJobMode = 'Presencial' | 'Remoto' | 'Híbrido'

export interface MyJob {
  jobId: number
  compania: string
  estado: MyJobStatus
  cargo: string
  modalidad: MyJobMode
  fechaInicio: string
  fechaFin: string
}

export interface MyJobFilters {
  page?: number
  size?: number
  search?: string
}

export interface MyJobFormValues {
  compania: string
  cargo: string
  modalidad: MyJobMode | ''
  fechaInicio: string
  fechaFin: string
  estado: MyJobStatus
}

export interface MyJobPayload {
  compania: string
  cargo: string
  modalidad: MyJobMode
  fecha_inicio: string
  fecha_fin: string
  estado: MyJobStatus
}

export interface MyJobApiResponse {
  job_id: number
  compania: string
  estado: MyJobStatus
  cargo: string
  modalidad: MyJobMode
  fecha_inicio: string
  fecha_fin: string
}
