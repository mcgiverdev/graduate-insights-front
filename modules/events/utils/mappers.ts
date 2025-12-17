import type {
  Event,
  EventApiResponse,
  EventFormValues,
  EventPayload,
} from '../types'

export const toEvent = (event: EventApiResponse): Event => ({
  eventId: event.event_id,
  nombre: event.nombre,
  contenido: event.contenido,
  estado: event.estado,
  directorId: event.director_id,
  directorNombre: event.director_nombre,
  eventTypeId: event.event_type_id,
  eventTypeNombre: event.event_type_nombre,
})

export const toFormValues = (event?: Event | null): EventFormValues => ({
  nombre: event?.nombre ?? '',
  contenido: event?.contenido ?? '',
  estado: event?.estado ?? '1',
  directorId: event?.directorId ?? null,
  eventTypeId: event?.eventTypeId ?? null,
})

export const toPayload = (values: EventFormValues): EventPayload => ({
  nombre: values.nombre.trim(),
  contenido: values.contenido.trim(),
  estado: values.estado,
  director_id: Number(values.directorId),
  event_type_id: Number(values.eventTypeId),
})
