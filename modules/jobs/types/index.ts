export type JobStatus = '0' | '1'
export type JobMode = 'Presencial' | 'Remoto' | 'Híbrido'

export interface Job {
  jobId: number
  compania: string
  estado: JobStatus
  cargo: string
  modalidad: JobMode
  fechaInicio: string
  fechaFin: string
  graduateId: number
  graduateName: string
}

export interface JobFilters {
  page?: number
  size?: number
  search?: string
}

export interface JobFormValues {
  compania: string
  cargo: string
  modalidad: JobMode | ''
  fechaInicio: string
  fechaFin: string
  graduateId: number | null
  estado: JobStatus
}

export interface JobPayload {
  compania: string
  cargo: string
  modalidad: JobMode
  fecha_inicio: string
  fecha_fin: string
  graduate_id: number
  estado: JobStatus
}

export interface JobApiResponse {
  job_id: number
  compania: string
  estado: JobStatus
  cargo: string
  modalidad: JobMode
  fecha_inicio: string
  fecha_fin: string
  graduate_id: number
  graduate_name: string
}
