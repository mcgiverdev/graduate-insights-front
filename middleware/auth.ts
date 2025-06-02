export default defineNuxtRouteMiddleware(to => {
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
})
