import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'
import type { PasswordChangePayload, Profile, ProfileApiResponse, ProfilePayload } from '../types'
import { toProfile } from '../utils/mappers'

const PROFILE_ENDPOINT = '/graduate-insights/v1/api/user'
const PASSWORD_ENDPOINT = '/graduate-insights/v1/api/mail/change-password'

class ProfileService extends BaseApiService {
  async fetchById(id: number): Promise<Profile | null> {
    const response = await this.get<ApiEnvelope<ProfileApiResponse>>(`${PROFILE_ENDPOINT}/${id}`)
    return response.data ? toProfile(response.data) : null
  }

  async update(id: number, payload: ProfilePayload) {
    return this.put<ApiEnvelope<void>>(`${PROFILE_ENDPOINT}/${id}`, { body: payload })
  }

  async changePassword(payload: PasswordChangePayload) {
    return this.post<ApiEnvelope<void>>(PASSWORD_ENDPOINT, { body: payload })
  }
}

export const profileService = new ProfileService()
