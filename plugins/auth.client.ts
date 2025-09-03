export default defineNuxtPlugin(async () => {
  const router = useRouter()
  const route = useRoute()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/validate-code']

  // Función para verificar autenticación
  const checkAuth = async (to: any) => {
    const token = useCookie('accessToken', {
      path: '/',
      secure: true,
      sameSite: 'strict',
    })

    // Si la ruta es pública o tiene meta.public, permitir acceso
    if (publicRoutes.includes(to.path) || to.meta.public)
      return true

    // Si no hay token y la ruta no es pública, redirigir al login
    if (!token.value) {
      // Guardar la ruta actual para redirigir después del login
      const returnTo = useCookie('returnTo', {
        path: '/',
        secure: true,
        sameSite: 'strict',
      })

      returnTo.value = to.fullPath

      return '/login'
    }

    // Si hay token y la ruta no es pública ni es la de validación, verificar si el usuario está validado
    if (token.value && !publicRoutes.includes(to.path) && to.name !== 'validate-code') {
      try {
        const { data } = await useApi('/graduate-insights/v1/api/auth/me')

        // Si el usuario no está verificado y no estamos en la página de validación,
        // redirigir a la página de validación
        if (!data.data.verified) {
          return {
            path: '/validate-code',
            query: {
              email: data.data.email,
            },
          }
        }
      }
      catch (error: any) {
        // Si hay error al obtener la información del usuario, redirigir al login
        console.error('Error verificando usuario:', error)
        token.value = null

        // Guardar la ruta actual para redirigir después del login
        const returnTo = useCookie('returnTo', {
          path: '/',
          secure: true,
          sameSite: 'strict',
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
