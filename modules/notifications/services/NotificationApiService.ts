import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'
import type { AppNotification } from '../types'

const BASE = '/graduate-insights/v1/api/notifications'

class NotificationApiService extends BaseApiService {
  async fetchAll(): Promise<AppNotification[]> {
    const response = await this.get<ApiEnvelope<AppNotification[]>>(BASE)
    return response.data ?? []
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.get<ApiEnvelope<number>>(`${BASE}/unread-count`)
    return response.data ?? 0
  }

  async markAsRead(id: number): Promise<void> {
    await this.patch<ApiEnvelope<void>>(`${BASE}/${id}/mark-read`)
  }

  async markAllAsRead(): Promise<void> {
    await this.patch<ApiEnvelope<void>>(`${BASE}/mark-all-read`)
  }

  async remove(id: number): Promise<void> {
    await this.delete<ApiEnvelope<void>>(`${BASE}/${id}`)
  }
}

export const notificationApiService = new NotificationApiService()
