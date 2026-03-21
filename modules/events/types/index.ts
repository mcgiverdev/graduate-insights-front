export type EventStatus = '0' | '1'

export interface Event {
  eventId: number
  nombre: string
  contenido: string
  estado: EventStatus
  directorId: number
  directorNombre: string
  eventTypeId: number
  eventTypeNombre: string
}

export interface EventFilters {
  page?: number
  size?: number
  search?: string
}

export interface EventFormValues {
  nombre: string
  contenido: string
  directorId: number | null
  eventTypeId: number | null
}

export interface EventPayload {
  nombre: string
  contenido: string
  director_id: number
  event_type_id: number
}

export interface EventApiResponse {
  event_id: number
  nombre: string
  contenido: string
  estado: EventStatus
  director_id: number
  director_nombre: string
  event_type_id: number
  event_type_nombre: string
}
