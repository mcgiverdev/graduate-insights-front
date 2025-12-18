export type MyJobOfferStatus = '0' | '1'

export interface MyJobOffer {
  jobOfferId: number
  titulo: string
  link: string
  descripcion: string
  estado: MyJobOfferStatus
}

export interface MyJobOfferFilters {
  page?: number
  size?: number
  search?: string
}

export interface MyJobOfferFormValues {
  titulo: string
  link: string
  descripcion: string
}

export interface MyJobOfferPayload {
  titulo: string
  link: string
  descripcion: string
}

export interface MyJobOfferApiResponse {
  job_offers_id: number
  titulo: string
  link: string
  descripcion: string
  estado: MyJobOfferStatus
}
