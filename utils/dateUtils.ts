/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) a formato legible en español
 * Evita problemas de zona horaria agregando un tiempo específico
 *
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @param options - Opciones de formateo (opcional)
 * @returns Fecha formateada o '-' si no hay fecha
 */
export function formatDate(
  dateString?: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  if (!dateString)
    return '-'

  // Agregar tiempo para evitar problemas de zona horaria
  const date = new Date(`${dateString}T12:00:00`)

  return date.toLocaleDateString('es-ES', options)
}

/**
 * Formatea una fecha con hora en formato completo
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString)
    return '-'

  const date = new Date(dateString)

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Verifica si una fecha es válida
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)

  return !isNaN(date.getTime())
}
