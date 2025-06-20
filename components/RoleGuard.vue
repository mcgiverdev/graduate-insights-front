<script setup lang="ts">
import { type Role, useRoles } from '@/composables/useRoles'

interface Props {
  roles?: Role[]
  permission?: string
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permission: '',
  fallback: false,
})

const { hasAnyRole, hasPermission, role } = useRoles()

const canShow = computed(() => {
  // Si no hay usuario logueado, no mostrar
  if (!role.value)
    return false

  // Si se especificó un permiso específico
  if (props.permission)
    return hasPermission(props.permission as any)

  // Si se especificaron roles
  if (props.roles.length > 0)
    return hasAnyRole(props.roles)

  // Si no se especificó ni permiso ni roles, mostrar para usuarios logueados
  return true
})
</script>

<template>
  <div v-if="canShow">
    <slot />
  </div>
  <div v-else-if="fallback">
    <slot name="fallback">
      <div class="text-center pa-4">
        <VIcon
          icon="tabler-lock"
          size="48"
          class="text-disabled mb-4"
        />
        <h4>Acceso Restringido</h4>
        <p class="text-medium-emphasis">
          No tienes permisos para ver este contenido
        </p>
      </div>
    </slot>
  </div>
</template>
