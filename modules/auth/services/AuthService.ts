import { useRuntimeConfig } from '#imports'
import { useApi } from '@/composables/useApi'
import type { LoginResult, VerificationPayload, VerificationResult } from '../types'

interface LoginResponse {
  success: boolean
  message?: string
  data: string
}

const LOGIN_ENDPOINT = '/graduate-insights/v1/api/auth/login'
const VALIDATE_ENDPOINT = '/graduate-insights/v1/api/mail/validate-code'
const RESEND_ENDPOINT = '/graduate-insights/v1/api/mail/send-code'
const ME_ENDPOINT = '/graduate-insights/v1/api/auth/me'

const updateTokenCookie = (token?: string | null) => {
  const isSecure = process.client && window.location.protocol === 'https:'
  const cookie = useCookie('accessToken', {
    maxAge: 60 * 60 * 24,
    path: '/',
    secure: isSecure,
    sameSite: isSecure ? 'strict' : 'lax',
  })

  cookie.value = token ?? null
}

const fetchVerificationStatus = (token: string) => {
  const config = useRuntimeConfig()

  return $fetch<{ data: { verified: boolean } }>(ME_ENDPOINT, {
    baseURL: config.public.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

class AuthModuleService {
  async login(email: string, password: string): Promise<LoginResult> {
    const response = await useApi<LoginResponse>(LOGIN_ENDPOINT, {
      method: 'POST',
      body: { email, password },
    })

    const loginData = response.data

    if (!loginData.success)
      return { success: false, message: loginData.message || 'Error al iniciar sesión' }

    updateTokenCookie(loginData.data)

    try {
      const meResponse = await fetchVerificationStatus(loginData.data)

      if (!meResponse.data.verified) {
        return {
          success: true,
          message: loginData.message || 'Completa la verificación de tu cuenta.',
          redirectTo: {
            path: '/validate-code',
            query: { email },
          },
        }
      }

      return { success: true, message: loginData.message || 'Sesión iniciada correctamente' }
    }
    catch (error) {
      console.error('Error al obtener información del usuario:', error)
      updateTokenCookie(null)
      return { success: false, message: 'Error al obtener información del usuario' }
    }
  }

  async verifyCode(payload: VerificationPayload): Promise<VerificationResult> {
    const response = await useApi(VALIDATE_ENDPOINT, {
      method: 'POST',
      body: payload,
    })

    const success = response.status === 200

    return {
      success,
      message: success ? undefined : 'El código ingresado no es válido',
    }
  }

  async resendCode(email: string): Promise<VerificationResult> {
    const response = await useApi(RESEND_ENDPOINT, {
      method: 'POST',
      body: { email },
    })

    const success = response.status === 200

    return {
      success,
      message: success
        ? 'Código reenviado correctamente. Revisa tu correo electrónico.'
        : 'Error al reenviar el código. Intenta nuevamente.',
    }
  }
}

export const authModuleService = new AuthModuleService()
