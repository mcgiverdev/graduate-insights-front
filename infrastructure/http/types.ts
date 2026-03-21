export interface Paginate {
  totalElements?: number
  totalPages?: number
  currentPage?: number
}

export interface ApiEnvelope<T> {
  data: T
  paginate?: Paginate
  errors?: Record<string, string> | string[]
  success: boolean
  message?: string
}

export interface ListResponse<T> {
  items: T[]
  paginate?: Paginate
}

export interface RequestResult {
  success: boolean
  message?: string
}
