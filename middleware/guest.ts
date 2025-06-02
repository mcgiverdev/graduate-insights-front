export default defineNuxtRouteMiddleware(to => {
  const token = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  // Si hay token y la ruta es pública (login, register, etc), redirigir al dashboard
  if (token.value) {
    // Verificar si el token es válido haciendo una petición al backend
    return navigateTo('/')
  }
})
