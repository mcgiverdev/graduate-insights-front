export type JobOfferStatus = '0' | '1'

export interface JobOffer {
  jobOfferId: number
  titulo: string
  link: string
  descripcion: string
  estado: JobOfferStatus
  employerId: number
  employerName: string
}

export interface JobOfferFilters {
  page?: number
  size?: number
  search?: string
}

export interface JobOfferFormValues {
  titulo: string
  link: string
  descripcion: string
  estado: JobOfferStatus
  employerId: number | null
}

export interface JobOfferPayload {
  titulo: string
  link: string
  descripcion: string
  estado: JobOfferStatus
  employer_id: number
}

export interface JobOfferApiResponse {
  job_offers_id: number
  titulo: string
  link: string
  descripcion: string
  estado: JobOfferStatus
  employer_id: number
  employer_name: string
}
