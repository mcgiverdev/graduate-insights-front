import { computed } from 'vue'
import { useUser } from '@/composables/useUser'

// Definimos los roles disponibles en el sistema
export const ROLES = {
  GRADUADO: 'Graduado',
  EMPLEADOR: 'Empleador',
  DIRECTOR: 'Director',
  ADMINISTRADOR: 'Administrador',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Definimos los permisos para cada rol
export const ROLE_PERMISSIONS = {
  [ROLES.GRADUADO]: {
    canViewSurveys: true,
    canCreateSurveys: false,
    canViewGraduates: false,
    canManageGraduates: false,
    canViewEmployers: false,
    canManageEmployers: false,
    canViewDirectors: false,
    canManageDirectors: false,
    canViewEducationCenters: false,
    canManageEducationCenters: false,
    canViewAnalytics: false,
    canManageUsers: false,
  },
  [ROLES.EMPLEADOR]: {
    canViewSurveys: true,
    canCreateSurveys: true,
    canViewGraduates: true,
    canManageGraduates: false,
    canViewEmployers: false,
    canManageEmployers: false,
    canViewDirectors: false,
    canManageDirectors: false,
    canViewEducationCenters: false,
    canManageEducationCenters: false,
    canViewAnalytics: true,
    canManageUsers: false,
  },
  [ROLES.DIRECTOR]: {
    canViewSurveys: true,
    canCreateSurveys: true,
    canViewGraduates: true,
    canManageGraduates: true,
    canViewEmployers: true,
    canManageEmployers: true,
    canViewDirectors: true,
    canManageDirectors: false,
    canViewEducationCenters: true,
    canManageEducationCenters: true,
    canViewAnalytics: true,
    canManageUsers: true,
  },
  [ROLES.ADMINISTRADOR]: {
    canViewSurveys: true,
    canCreateSurveys: true,
    canViewGraduates: true,
    canManageGraduates: true,
    canViewEmployers: true,
    canManageEmployers: true,
    canViewDirectors: true,
    canManageDirectors: true,
    canViewEducationCenters: true,
    canManageEducationCenters: true,
    canViewAnalytics: true,
    canManageUsers: true,
  },
}

export const useRoles = () => {
  const { user, role } = useUser()

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleToCheck: Role) => {
    return role.value === roleToCheck
  }

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles: Role[]) => {
    return role.value && roles.includes(role.value as Role)
  }

  // Obtener permisos del rol actual
  const permissions = computed(() => {
    if (!role.value || !(role.value in ROLE_PERMISSIONS))
      return null

    return ROLE_PERMISSIONS[role.value as Role]
  })

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS[Role]) => {
    if (!permissions.value)
      return false

    return permissions.value[permission] === true
  }

  // Verificar si el usuario puede acceder a una ruta específica
  const canAccessRoute = (routeName: string) => {
    if (!permissions.value)
      return false

    const routePermissions: Record<string, keyof typeof ROLE_PERMISSIONS[Role]> = {
      'egresados': 'canViewGraduates',
      'empleadores': 'canViewEmployers',
      'directores': 'canViewDirectors',
      'centros-educativos': 'canViewEducationCenters',
      'encuestas': 'canViewSurveys',
    }

    const requiredPermission = routePermissions[routeName]
    if (!requiredPermission)
      return true // Si no está definido, permitir acceso

    return hasPermission(requiredPermission)
  }

  // Verificar si el usuario es administrador o director (roles con más permisos)
  const isAdmin = computed(() => hasRole(ROLES.ADMINISTRADOR))
  const isDirector = computed(() => hasRole(ROLES.DIRECTOR))
  const isEmployer = computed(() => hasRole(ROLES.EMPLEADOR))
  const isGraduate = computed(() => hasRole(ROLES.GRADUADO))

  // Verificar si tiene permisos administrativos
  const hasAdminAccess = computed(() => isAdmin.value || isDirector.value)

  return {
    // Estado del usuario
    user,
    role,

    // Verificación de roles
    hasRole,
    hasAnyRole,
    isAdmin,
    isDirector,
    isEmployer,
    isGraduate,
    hasAdminAccess,

    // Permisos
    permissions,
    hasPermission,
    canAccessRoute,

    // Constantes
    ROLES,
    ROLE_PERMISSIONS,
  }
}
