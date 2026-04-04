export type FeedType = 'EVENT' | 'JOB_OFFER'

export interface FeedItem {
  id: number
  tipo: FeedType
  titulo: string
  descripcion: string
  contenido: string
  fecha_creacion: string
  fuente: string
  estado: string
  tipo_evento?: string
  empresa?: string
  link?: string
  enlace_inscripcion?: string
}

export interface FeedListParams {
  page?: number
  size?: number
}

export interface FeedFiltersState {
  showEvents: boolean
  showJobs: boolean
}

export interface FeedPagination {
  totalPages: number
  currentPage: number
  totalElements: number
}

export interface FeedListResult {
  items: FeedItem[]
  paginate: FeedPagination
}
