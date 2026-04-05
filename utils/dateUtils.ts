/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) a formato legible en español
 * Evita problemas de zona horaria agregando un tiempo específico
 *
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada o '-' si no hay fecha
 */
export const formatReadableDate = (dateString: string | null | undefined): string => {
  if (!dateString)
    return '-'

  try {
    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (Number.isNaN(date.getTime()))
      return '-'

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }
  catch (error) {
    console.error('Error al formatear la fecha:', error)

    return '-'
  }
}

/**
 * Formatea una fecha mostrando solo día, mes y año (sin hora)
 */
export const formatDateOnly = (dateString: string | null | undefined): string => {
  if (!dateString)
    return '-'

  try {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime()))
      return '-'

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
  catch {
    return '-'
  }
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

  return !Number.isNaN(date.getTime())
}
