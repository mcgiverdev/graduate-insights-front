<script lang="ts" setup>
import { useNotifications } from '@/modules/notifications/composables/useNotifications'

const {
  notifications,
  fetchNotifications,
  markRead,
  markUnread,
  removeNotification,
} = useNotifications()

const POLL_INTERVAL_MS = 30_000

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchNotifications()
  pollTimer = setInterval(fetchNotifications, POLL_INTERVAL_MS)
})

onUnmounted(() => {
  if (pollTimer !== null)
    clearInterval(pollTimer)
})

const handleNotificationClick = (notification: any) => {
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnread"
    @click:notification="handleNotificationClick"
  />
</template>
