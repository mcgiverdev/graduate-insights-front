import type {
  EventType,
  EventTypeApiResponse,
  EventTypeFormValues,
  EventTypePayload,
} from '../types'

export const toEventType = (eventType: EventTypeApiResponse): EventType => ({
  eventTypeId: eventType.event_type_id,
  nombre: eventType.nombre,
  estado: eventType.estado,
})

export const toFormValues = (eventType?: EventType | null): EventTypeFormValues => ({
  nombre: eventType?.nombre ?? '',
})

export const toPayload = (values: EventTypeFormValues): EventTypePayload => ({
  nombre: values.nombre.trim(),
})
