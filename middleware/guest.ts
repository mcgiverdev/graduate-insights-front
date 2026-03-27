export default defineNuxtRouteMiddleware(async to => {
  const token = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  // Si hay token y la ruta es pública (login, register, etc), redirigir al dashboard
  if (!token.value)
    return

  try {
    const { data } = await useApi('/graduate-insights/v1/api/auth/me')

    if (!data?.data?.verified) {
      return navigateTo({
        path: '/validar-codigo',
        query: {
          email: data?.data?.email,
        },
      })
    }

    return navigateTo('/')
  }
  catch {
    token.value = null
  }
})
