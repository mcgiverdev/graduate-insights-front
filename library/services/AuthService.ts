import { useCookie } from '#app'

// Servicio para manejar la autenticación
class AuthService {
  private static instance: AuthService

  private constructor() {
    // Intentar recuperar el token del localStorage al iniciar
  }

  static getInstance(): AuthService {
    if (!AuthService.instance)
      AuthService.instance = new AuthService()

    return AuthService.instance
  }

  getToken(): string | null {
    const accessToken = useCookie('accessToken', {
      path: '/',
      secure: true,
      sameSite: 'strict',
    })

    return accessToken.value
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()

    if (!token)
      return {}

    return { Authorization: `Bearer ${token}` }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = AuthService.getInstance()
