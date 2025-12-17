export interface EventType {
  eventTypeId: number
  nombre: string
  estado?: string
}

export interface EventTypeApiResponse {
  event_type_id: number
  nombre: string
  estado?: string
}

export interface EventTypeFilters {
  page?: number
  size?: number
  search?: string
}

export interface EventTypePayload {
  nombre: string
}

export interface EventTypeFormValues {
  nombre: string
}
