import { useUser } from '@/composables/useUser'

export default defineNuxtPlugin(async () => {
  const router = useRouter()
  const route = useRoute()
  const { user, fetchUser } = useUser()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/validar-codigo']

  // Función para verificar autenticación
  const checkAuth = async (to: any) => {
    // En producción, solo usar secure si estamos en HTTPS
    const isSecure = process.client && window.location.protocol === 'https:'

    const token = useCookie('accessToken', {
      path: '/',
      secure: isSecure,
      sameSite: isSecure ? 'strict' : 'lax',
    })

    // Si la ruta es pública o tiene meta.public, permitir acceso
    if (publicRoutes.includes(to.path) || to.meta.public)
      return true

    // Si no hay token y la ruta no es pública, redirigir al login
    if (!token.value) {
      const returnTo = useCookie('returnTo', {
        path: '/',
        secure: isSecure,
        sameSite: isSecure ? 'strict' : 'lax',
      })

      returnTo.value = to.fullPath

      return '/login'
    }

    // Si hay token y la ruta no es pública ni es la de validación, verificar el usuario
    if (!publicRoutes.includes(to.path) && to.name !== 'validar-codigo') {
      try {
        // Solo llamar al API si aún no tenemos el usuario cargado en memoria
        if (!user.value) {
          await fetchUser()
        }

        if (!user.value) {
          // fetchUser falló (token inválido o expirado)
          token.value = null
          const returnTo = useCookie('returnTo', {
            path: '/',
            secure: isSecure,
            sameSite: isSecure ? 'strict' : 'lax',
          })
          returnTo.value = to.fullPath
          return '/login'
        }

        // Si el usuario no está verificado, redirigir a validación
        if (!user.value.verified) {
          return {
            path: '/validar-codigo',
            query: { email: user.value.email },
          }
        }
      }
      catch (error: any) {
        console.error('Error verificando usuario:', error)
        token.value = null

        const returnTo = useCookie('returnTo', {
          path: '/',
          secure: isSecure,
          sameSite: isSecure ? 'strict' : 'lax',
        })

        returnTo.value = to.fullPath

        return '/login'
      }
    }

    return true
  }

  // Verificar autenticación en cada cambio de ruta
  router.beforeEach(checkAuth)

  // Verificación inicial para SPA mode
  if (process.client) {
    const result = await checkAuth(route)
    if (typeof result === 'string' || (typeof result === 'object' && result.path))
      await navigateTo(result)
  }
})
