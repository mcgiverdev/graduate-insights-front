import type { KeyValueOption } from '../types/keyValue'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'

// Some lookup endpoints return an envelope while others respond with the raw array, so normalize here.
const extractOptions = (response: ApiEnvelope<KeyValueOption[]> | KeyValueOption[] | undefined) => {
  if (!response)
    return []

  if (Array.isArray(response))
    return response

  return response.data ?? []
}

class KeyValueService extends BaseApiService {
  async fetch(endpoint: string): Promise<KeyValueOption[]> {
    const response = await this.get<ApiEnvelope<KeyValueOption[]> | KeyValueOption[]>(endpoint)

    return extractOptions(response)
  }
}

export const keyValueService = new KeyValueService()
