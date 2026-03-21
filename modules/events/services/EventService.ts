import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  Event,
  EventApiResponse,
  EventFilters,
  EventPayload,
} from '../types'
import { toEvent } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/event'

class EventService extends BaseApiService {
  async fetchList(filters: EventFilters = {}): Promise<ListResponse<Event>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<EventApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toEvent)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<Event | null> {
    const response = await this.get<ApiEnvelope<EventApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toEvent(response.data) : null
  }

  async create(payload: EventPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: EventPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const eventService = new EventService()
