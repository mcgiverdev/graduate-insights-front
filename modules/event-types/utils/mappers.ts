import type { EventType, EventTypeFormValues, EventTypePayload } from '../types'

export const toFormValues = (eventType?: EventType | null): EventTypeFormValues => ({
  nombre: eventType?.nombre ?? '',
})

export const toPayload = (values: EventTypeFormValues): EventTypePayload => ({
  nombre: values.nombre.trim(),
})
