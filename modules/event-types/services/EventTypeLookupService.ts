import type { EventTypeApiResponse } from '../types'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

const BASE_ENDPOINT = '/graduate-insights/v1/api/event_types'

class EventTypeLookupService extends BaseApiService {
  async fetchAll(): Promise<KeyValueOption[]> {
    const response = await this.get<ApiEnvelope<EventTypeApiResponse[]>>(BASE_ENDPOINT)

    return (response.data || []).map(eventType => ({
      key: eventType.event_type_id,
      value: eventType.nombre,
    }))
  }
}

export const eventTypeLookupService = new EventTypeLookupService()
