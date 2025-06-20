import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { useUser } from '@/composables/useUser'

interface LoginResponse {
  success: boolean
  message: string
  data: string
}

interface LoginError {
  error: string
}

interface AuthError {
  errors: string[]
}

export const useAuthService = () => {
  const loading = ref(false)

  const login = async (email: string, password: string) => {
    try {
      loading.value = true

      const response = await useApi<LoginResponse>('/graduate-insights/v1/api/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })

      // Acceder a los datos de la respuesta correctamente
      const loginData = response.data

      if (loginData.success) {
        // Guardar el token en una cookie
        const token = useCookie('accessToken', {
          maxAge: 60 * 60 * 24, // 24 horas
          path: '/',
          secure: true,
          sameSite: 'strict',
        })

        token.value = loginData.data

        // Obtener la ruta guardada o redirigir al dashboard
        const returnTo = useCookie('returnTo', {
          path: '/',
          secure: true,
          sameSite: 'strict',
        })

        const redirectPath = returnTo.value || '/'

        // Limpiar la cookie de retorno
        returnTo.value = null

        // Redirigir a la ruta guardada o al dashboard
        await navigateTo(redirectPath)

        return { success: true, message: loginData.message }
      }

      return { success: false, message: loginData.message || 'Error al iniciar sesión' }
    }
    catch (error: any) {
      console.error('Error en login:', error)

      const errorData = error.data as LoginError

      return { success: false, message: errorData?.error || 'Error al iniciar sesión' }
    }
    finally {
      loading.value = false
    }
  }

  const handleAuthError = (error: any) => {
    // Verificar si es un error de autenticación (401)
    if (error.statusCode === 401) {
      const errorData = error.data as AuthError
      if (errorData?.errors?.includes('An Authentication object was not found in the SecurityContext')) {
        // Obtener la ruta actual antes de eliminar el token
        const currentRoute = useRoute()
        const currentPath = currentRoute.fullPath

        // Eliminar el token
        const token = useCookie('accessToken', {
          path: '/',
          secure: true,
          sameSite: 'strict',
        })

        token.value = null

        // Guardar la ruta actual en una cookie
        const returnTo = useCookie('returnTo', {
          path: '/',
          secure: true,
          sameSite: 'strict',
        })

        returnTo.value = currentPath

        // Redirigir al login
        navigateTo('/login')

        return true
      }
    }

    return false
  }

  const logout = () => {
    const token = useCookie('accessToken', {
      path: '/',
      secure: true,
      sameSite: 'strict',
    })

    token.value = null

    // Limpiar información del usuario
    const { clearUser } = useUser()

    clearUser()

    navigateTo('/login')
  }

  return {
    loading,
    login,
    handleAuthError,
    logout,
  }
}
