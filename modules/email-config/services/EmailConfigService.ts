import type { EmailConfig, EmailConfigApiResponse, EmailConfigPayload } from '../types'
import { toEmailConfig } from '../utils/mappers'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'

const BASE_ENDPOINT = '/graduate-insights/v1/api/admin/email-config'

class EmailConfigService extends BaseApiService {
  async fetchConfig(): Promise<EmailConfig | null> {
    const response = await this.get<ApiEnvelope<EmailConfigApiResponse>>(BASE_ENDPOINT)

    return response.data ? toEmailConfig(response.data) : null
  }

  async saveConfig(payload: EmailConfigPayload): Promise<EmailConfig> {
    const response = await this.put<ApiEnvelope<EmailConfigApiResponse>>(BASE_ENDPOINT, {
      body: payload,
    })

    return toEmailConfig(response.data)
  }

  async sendTestEmail(email: string): Promise<void> {
    await this.post<ApiEnvelope<void>>(`${BASE_ENDPOINT}/test`, {
      body: { email },
    })
  }
}

export const emailConfigService = new EmailConfigService()
