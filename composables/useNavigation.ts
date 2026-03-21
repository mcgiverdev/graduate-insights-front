import { computed } from 'vue'
import { useRoles } from '@/composables/useRoles'

interface NavItem {
  title: string
  to?: any
  icon?: any
  requiredRoles?: string[]
  children?: NavItem[]
}

export const useNavigation = () => {
  const { hasAnyRole, role } = useRoles()

  const filterNavItem = (item: NavItem): boolean => {
    // Si el elemento no tiene requiredRoles, está disponible para todos
    if (!item.requiredRoles || item.requiredRoles.length === 0)
      return true

    // Si no hay usuario logueado, no mostrar elementos que requieren roles
    if (!role.value)
      return false

    // Verificar si el usuario tiene alguno de los roles requeridos
    return hasAnyRole(item.requiredRoles as any)
  }

  const getFilteredNavItems = (navItems: NavItem[]) => {
    return computed(() => {
      if (!role.value)
        return []

      return navItems.filter(item => {
        // Filtrar el elemento principal
        if (!filterNavItem(item))
          return false

        // Si tiene hijos, filtrarlos también
        if (item.children)
          item.children = item.children.filter(filterNavItem)

        return true
      })
    })
  }

  return {
    getFilteredNavItems,
    filterNavItem,
  }
}
