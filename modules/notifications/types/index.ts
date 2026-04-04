export interface AppNotification {
  id: number
  userId: number
  titulo: string
  mensaje: string
  tipo: string
  leido: boolean
  fechaCreacion: string | null
}
