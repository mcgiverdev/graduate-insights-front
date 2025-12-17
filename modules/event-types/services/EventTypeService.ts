import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  EventType,
  EventTypeApiResponse,
  EventTypeFilters,
  EventTypePayload,
} from '../types'
import { toEventType } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/event_types'

class EventTypeService extends BaseApiService {
  async fetchList(filters: EventTypeFilters = {}): Promise<ListResponse<EventType>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<EventTypeApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toEventType)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<EventType | null> {
    const response = await this.get<ApiEnvelope<EventTypeApiResponse>>(`${BASE_ENDPOINT}/${id}`)

    return response.data ? toEventType(response.data) : null
  }

  async create(payload: EventTypePayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: EventTypePayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const eventTypeService = new EventTypeService()
