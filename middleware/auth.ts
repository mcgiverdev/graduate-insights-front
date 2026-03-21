export default defineNuxtRouteMiddleware(async to => {
  // En modo SPA, el plugin auth.client.ts maneja la autenticación
  // Este middleware solo se ejecuta en modo SSR
  if (process.client && !process.server)
    return

  const token = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token.value && !to.meta.public) {
    // Guardar la ruta actual para redirigir después del login
    const returnTo = useCookie('returnTo', {
      path: '/',
      secure: true,
      sameSite: 'strict',
    })

    returnTo.value = to.fullPath

    return navigateTo('/login')
  }

  // Si hay token y la ruta no es pública ni es la de validación, verificar si el usuario está validado
  if (token.value && !to.meta.public && to.name !== 'validate-code') {
    try {
      const { data } = await useApi('/graduate-insights/v1/api/auth/me')

      // Si el usuario no está verificado y no estamos en la página de validación,
      // redirigir a la página de validación
      if (!data.data.verified) {
        return navigateTo({
          path: '/validate-code',
          query: {
            email: data.data.email,
          },
        })
      }
    }
    catch (error) {
      // Si hay error al obtener la información del usuario, redirigir al login
      token.value = null

      return navigateTo('/login')
    }
  }
})
