import type { Profile, ProfileApiResponse, ProfilePayload } from '../types'
import { toProfile } from '../utils/mappers'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'

const PROFILE_ENDPOINT = '/graduate-insights/v1/api/auth/me/profile'
const PASSWORD_ENDPOINT = '/graduate-insights/v1/api/auth/me/password'

class ProfileService extends BaseApiService {
  async fetchOwnProfile(): Promise<Profile | null> {
    const response = await this.get<ApiEnvelope<ProfileApiResponse>>(PROFILE_ENDPOINT)

    return response.data ? toProfile(response.data) : null
  }

  async updateOwnProfile(payload: ProfilePayload) {
    return this.put<ApiEnvelope<void>>(PROFILE_ENDPOINT, { body: payload })
  }

  async changePassword(newPassword: string) {
    return this.post<ApiEnvelope<void>>(PASSWORD_ENDPOINT, { body: { new_password: newPassword } })
  }
}

export const profileService = new ProfileService()
