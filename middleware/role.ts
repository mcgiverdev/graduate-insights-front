import { useRoles } from '@/composables/useRoles'
import { useUser } from '@/composables/useUser'

export default defineNuxtRouteMiddleware(async to => {
  const { canAccessRoute, role } = useRoles()
  const { fetchUser } = useUser()
  const token = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  if (!role.value && token.value)
    await fetchUser()

  // Si el usuario no tiene rol asignado, redirigir al login
  if (!role.value)
    return navigateTo('/login')

  // Obtener el nombre de la ruta para verificar permisos
  const routeName = to.name?.toString()

  if (routeName && !canAccessRoute(routeName)) {
    // Si no tiene permisos, mostrar página de error 403 o redirigir
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permisos para acceder a esta página',
    })
  }
})
