import { computed, ref } from 'vue'
import type { Notification } from '@layouts/types'
import type { AppNotification } from '../types'
import { notificationApiService } from '../services/NotificationApiService'

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr)
    return ''

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffMin < 1)
    return 'Ahora'
  if (diffMin < 60)
    return `Hace ${diffMin} min`
  if (diffHr < 24)
    return `Hace ${diffHr}h`
  if (diffDays === 1)
    return 'Ayer'

  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function toUiNotification(n: AppNotification): Notification {
  return {
    id: n.id,
    title: n.titulo,
    subtitle: n.mensaje,
    time: formatRelativeTime(n.fechaCreacion),
    isSeen: n.leido,
    icon: n.tipo === 'OFERTA_LABORAL' ? 'tabler-briefcase' : 'tabler-bell',
    color: n.tipo === 'OFERTA_LABORAL' ? 'primary' : undefined,
  }
}

const notifications = ref<Notification[]>([])
const loading = ref(false)

export function useNotifications() {
  const unreadCount = computed(() => notifications.value.filter(n => !n.isSeen).length)

  async function fetchNotifications() {
    if (loading.value)
      return
    loading.value = true
    try {
      const data = await notificationApiService.fetchAll()
      notifications.value = data.map(toUiNotification)
    }
    catch {
      // silently fail — bell will stay empty
    }
    finally {
      loading.value = false
    }
  }

  async function markRead(ids: number[]) {
    for (const id of ids) {
      const n = notifications.value.find(x => x.id === id)
      if (n && !n.isSeen) {
        n.isSeen = true
        await notificationApiService.markAsRead(id).catch(() => {})
      }
    }
  }

  async function markUnread(ids: number[]) {
    ids.forEach((id) => {
      const n = notifications.value.find(x => x.id === id)
      if (n)
        n.isSeen = false
    })
  }

  async function markAllRead() {
    notifications.value.forEach(n => (n.isSeen = true))
    await notificationApiService.markAllAsRead().catch(() => {})
  }

  async function removeNotification(id: number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1)
      notifications.value.splice(index, 1)
    await notificationApiService.remove(id).catch(() => {})
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    removeNotification,
  }
}
