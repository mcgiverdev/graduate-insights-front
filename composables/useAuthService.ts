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
        const isProduction = process.env.NODE_ENV === 'production'

        const token = useCookie('accessToken', {
          maxAge: 60 * 60 * 24, // 24 horas
          path: '/',
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
        })

        // Guardar el token
        token.value = loginData.data

        try {
          // Hacer una nueva instancia de useApi con el token actualizado
          const userResponse = await $fetch<{ data: { verified: boolean } }>('/graduate-insights/v1/api/auth/me', {
            baseURL: useRuntimeConfig().public.apiBaseUrl,
            headers: {
              Authorization: `Bearer ${loginData.data}`,
            },
          })

          // Si el usuario no está verificado, redirigir a la página de validación
          if (!userResponse.data.verified) {
            return navigateTo({
              path: '/validate-code',
              query: {
                email,
              },
            })
          }

          // Si está verificado, no hacer redirección desde aquí
          // La redirección se manejará desde la página de login
          return { success: true, message: loginData.message }
        }
        catch (meError) {
          console.error('Error al obtener información del usuario:', meError)

          // Si falla la obtención del usuario, limpiar el token y mostrar error
          token.value = null

          return { success: false, message: 'Error al obtener información del usuario' }
        }
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
        const isProduction = process.env.NODE_ENV === 'production'

        // Eliminar el token
        const token = useCookie('accessToken', {
          path: '/',
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
        })

        token.value = null

        // Guardar la ruta actual en una cookie
        const returnTo = useCookie('returnTo', {
          path: '/',
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
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
    const isProduction = process.env.NODE_ENV === 'production'

    const token = useCookie('accessToken', {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    })

    // Limpiar el token
    token.value = null

    // También limpiar la cookie returnTo si existe
    const returnTo = useCookie('returnTo', {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    })

    returnTo.value = null

    // Limpiar información del usuario
    const { clearUser } = useUser()

    clearUser()

    // Redirigir al login
    navigateTo('/login', { replace: true, external: false })
  }

  return {
    loading,
    login,
    handleAuthError,
    logout,
  }
}
