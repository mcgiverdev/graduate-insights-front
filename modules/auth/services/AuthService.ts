import { useRuntimeConfig } from '#imports'
import { useApi } from '@/composables/useApi'
import type { ApiError } from '@/composables/useApi'
import type {
  LoginResult,
  PasswordChangePayload,
  RegisterFormValues,
  VerificationPayload,
  VerificationResult,
} from '../types'

interface LoginResponse {
  success: boolean
  message?: string
  data: string
}

interface ApiResponseWrapper<T> {
  success: boolean
  message?: string
  data: T
}

const LOGIN_ENDPOINT = '/graduate-insights/v1/api/auth/login'
const VALIDATE_ENDPOINT = '/graduate-insights/v1/api/mail/validate-code'
const RESEND_ENDPOINT = '/graduate-insights/v1/api/mail/send-code'
const CHANGE_PASSWORD_ENDPOINT = '/graduate-insights/v1/api/mail/change-password'
const ME_ENDPOINT = '/graduate-insights/v1/api/auth/me'
const REGISTER_GRADUATE_ENDPOINT = '/graduate-insights/v1/api/graduate/register'

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

interface ParsedApiError {
  message: string
  fieldErrors?: Record<string, string>
}

class AuthModuleService {
  private parseApiError(error: unknown, fallback: string): ParsedApiError {
    const apiError = error as ApiError | undefined
    const data = apiError?.data as { errors?: unknown; message?: unknown } | undefined
    const errors = data?.errors

    if (errors) {
      if (Array.isArray(errors) && errors.length > 0)
        return { message: errors[0] ?? fallback }

      if (typeof errors === 'object') {
        const fieldErrors = errors as Record<string, string>
        const firstMessage = Object.values(fieldErrors)[0]
        return {
          message: (firstMessage?.length ? firstMessage : fallback) ?? fallback,
          fieldErrors,
        }
      }
    }

    if (typeof data?.message === 'string')
      return { message: data.message }

    if (apiError?.message)
      return { message: apiError.message }

    return { message: fallback }
  }

  private async sendCode(email: string, type: string): Promise<VerificationResult> {
    try {
      const response = await useApi(RESEND_ENDPOINT, {
        method: 'POST',
        body: { email, type },
      })

      const success = response.status === 200

      return {
        success,
        message: success
            ? 'Código enviado correctamente. Revisa tu bandeja de correo.'
            : 'No pudimos enviar el código. Intenta nuevamente en unos minutos.',
      }
    }
    catch (error) {
      const parsedError = this.parseApiError(
        error,
        'No pudimos enviar el código. Intenta nuevamente en unos minutos.',
      )

      return {
        success: false,
        message: parsedError.message,
        fieldErrors: parsedError.fieldErrors,
      }
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    let response: ApiResponse<LoginResponse>

    try {
      response = await useApi<LoginResponse>(LOGIN_ENDPOINT, {
        method: 'POST',
        body: { email, password },
      })
    }
    catch (error) {
      const parsedError = this.parseApiError(
        error,
        'Credenciales inválidas. Verifica tu correo y contraseña.',
      )

      return { success: false, message: parsedError.message }
    }

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
            path: '/validar-codigo',
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
    const result = await this.sendCode(email, '2')

    return {
      ...result,
      message: result.success
        ? 'Código reenviado correctamente. Revisa tu correo electrónico.'
        : result.message,
    }
  }

  async requestPasswordReset(email: string): Promise<VerificationResult> {
    const result = await this.sendCode(email, '1')

    return {
      ...result,
      message: result.success
        ? 'Hemos enviado un código para restablecer tu contraseña.'
        : result.message || 'No pudimos enviar el código de recuperación.',
    }
  }

  async resetPassword(payload: PasswordChangePayload): Promise<VerificationResult> {
    try {
      const response = await useApi(CHANGE_PASSWORD_ENDPOINT, {
        method: 'POST',
        body: {
          email: payload.email,
          code: payload.code,
          new_password: payload.newPassword,
        },
      })

      const success = response.status === 200

      return {
        success,
        message: success
          ? 'Tu contraseña se actualizó correctamente.'
          : 'No pudimos actualizar tu contraseña. Verifica el código ingresado.',
      }
    }
    catch (error) {
      const parsedError = this.parseApiError(
        error,
        'No pudimos actualizar tu contraseña. Verifica el código ingresado.',
      )

      return {
        success: false,
        message: parsedError.message,
        fieldErrors: parsedError.fieldErrors,
      }
    }
  }

  async registerGraduate(payload: RegisterFormValues): Promise<VerificationResult> {
    try {
      const response = await useApi<ApiResponseWrapper<null>>(REGISTER_GRADUATE_ENDPOINT, {
        method: 'POST',
        body: payload,
      })

      const registerData = response.data
      const message = registerData?.message
        || 'Registro exitoso. Revisa tu correo y espera la validación del director.'

      return {
        success: registerData?.success ?? true,
        message,
      }
    }
    catch (error) {
      const parsedError = this.parseApiError(
        error,
        'No pudimos crear tu cuenta. Intenta nuevamente en unos minutos.',
      )

      return {
        success: false,
        message: parsedError.message,
        fieldErrors: parsedError.fieldErrors,
      }
    }
  }
}

export const authModuleService = new AuthModuleService()
