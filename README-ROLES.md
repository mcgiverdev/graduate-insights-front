# Sistema de Roles y Permisos

Este proyecto implementa un sistema completo de roles y permisos para controlar el acceso a diferentes secciones y funcionalidades.

## Roles Disponibles

1. **Graduado** - Usuario graduado con acceso limitado
2. **Empleador** - Empresa que puede ver graduados y crear encuestas
3. **Director** - Administrador de centro educativo con amplios permisos
4. **Administrador** - Acceso completo al sistema

## Respuesta del Servicio /me

El servicio `/me` ahora retorna la información del usuario incluyendo su rol:

```json
{
  success: true,
  message: 'Datos del usuario obtenidos exitosamente',
  data: {
    id: 31,
    name: 'Mc Giver Avila',
    email: 'xmcgiver12@gmail.com',
    role: 'Graduado'
  },
}
```

## Uso de Composables

### useRoles()

Composable principal para verificar roles y permisos:

```typescript
import { useRoles, ROLES } from '@/composables/useRoles'

const { 
  role,           // Rol actual del usuario
  isAdmin,        // True si es administrador
  isDirector,     // True si es director
  isEmployer,     // True si es empleador
  isGraduate,     // True si es graduado
  hasRole,        // Función para verificar rol específico
  hasAnyRole,     // Función para verificar múltiples roles
  hasPermission,  // Función para verificar permisos
  canAccessRoute  // Función para verificar acceso a rutas
} = useRoles()

// Ejemplos de uso
if (isAdmin.value) {
  // Lógica para administradores
}

if (hasRole(ROLES.EMPLEADOR)) {
  // Lógica para empleadores
}

if (hasAnyRole([ROLES.DIRECTOR, ROLES.ADMINISTRADOR])) {
  // Lógica para directores y administradores
}

if (hasPermission('canManageGraduates')) {
  // Mostrar interfaz de gestión de graduados
}
```

### useUser()

Composable para gestión de información del usuario:

```typescript
import { useUser } from '@/composables/useUser'

const { 
  user,           // Información del usuario
  loading,        // Estado de carga
  fetchUser,      // Función para obtener datos del usuario
  initials,       // Iniciales del nombre
  role,           // Rol del usuario
  isRole,         // Verificar rol específico
  hasAnyRole,     // Verificar múltiples roles
  clearUser       // Limpiar datos del usuario
} = useUser()
```

## Componente RoleGuard

Componente para mostrar contenido condicionalmente:

```vue
<script setup>
import { ROLES } from '@/composables/useRoles'
import RoleGuard from '@/components/RoleGuard.vue'
</script>

<template>
  <!-- Mostrar solo a administradores -->
  <RoleGuard :roles="[ROLES.ADMINISTRADOR]">
    <VBtn color="error">
      Eliminar Usuario
    </VBtn>
  </RoleGuard>

  <!-- Mostrar solo a directores y administradores -->
  <RoleGuard :roles="[ROLES.DIRECTOR, ROLES.ADMINISTRADOR]">
    <VCard>
      <VCardTitle>Panel de Administración</VCardTitle>
    </VCard>
  </RoleGuard>

  <!-- Verificar permiso específico -->
  <RoleGuard permission="canManageGraduates">
    <VBtn>Gestionar Graduados</VBtn>
  </RoleGuard>

  <!-- Con fallback -->
  <RoleGuard
    :roles="[ROLES.EMPLEADOR]"
    fallback
  >
    <VAlert>Contenido para empleadores</VAlert>

    <template #fallback>
      <VAlert type="warning">
        Solo los empleadores pueden ver este contenido
      </VAlert>
    </template>
  </RoleGuard>
</template>
```

## Middleware de Roles

Para proteger rutas completas, usar el middleware `role`:

```typescript
// En cualquier página
definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})
```

Este middleware:
- Verifica que el usuario esté autenticado
- Verifica que tenga permisos para acceder a la ruta
- Muestra error 403 si no tiene permisos

## Configuración de Navegación

Los elementos de navegación se configuran con roles requeridos:

```typescript
// navigation/vertical/index.ts
export default [
  {
    title: 'Graduates',
    to: { name: 'graduates' },
    icon: { icon: 'tabler-users' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Directors',
    to: { name: 'directors' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.ADMINISTRADOR],
  },
]
```

Los elementos se filtran automáticamente según el rol del usuario.

## Permisos por Rol

### Graduado
- ✅ Ver encuestas
- ❌ Crear encuestas
- ❌ Ver otros graduados
- ❌ Gestionar usuarios

### Empleador
- ✅ Ver encuestas
- ✅ Crear encuestas
- ✅ Ver graduados
- ✅ Ver analíticas
- ❌ Gestionar usuarios

### Director
- ✅ Todas las funciones del empleador
- ✅ Ver empleadores
- ✅ Gestionar graduados
- ✅ Gestionar empleadores
- ✅ Ver centros educativos
- ✅ Gestionar centros educativos
- ✅ Gestionar usuarios
- ❌ Gestionar otros directores

### Administrador
- ✅ Acceso completo a todas las funciones
- ✅ Gestionar directores

## Ejemplos de Uso en Componentes

```vue
<script setup>
import { useRoles } from '@/composables/useRoles'

const {
  user,
  role,
  isGraduate,
  isEmployer,
  hasAdminAccess,
  hasPermission,
} = useRoles()

const getRoleColor = (role: string) => {
  const colors = {
    Graduado: 'success',
    Empleador: 'info',
    Director: 'warning',
    Administrador: 'error',
  }

  return colors[role] || 'default'
}
</script>

<template>
  <div>
    <!-- Solo mostrar a usuarios autenticados -->
    <div v-if="role">
      <h1>Bienvenido, {{ user?.name }}</h1>
      <VChip :color="getRoleColor(role)">
        {{ role }}
      </VChip>
    </div>

    <!-- Diferentes interfaces según el rol -->
    <VCard v-if="isGraduate">
      <VCardTitle>Panel de Graduado</VCardTitle>
      <VCardText>Aquí puedes ver y responder encuestas</VCardText>
    </VCard>

    <VCard v-if="isEmployer">
      <VCardTitle>Panel de Empleador</VCardTitle>
      <VCardText>Gestiona encuestas y busca talento</VCardText>
    </VCard>

    <VCard v-if="hasAdminAccess">
      <VCardTitle>Panel de Administración</VCardTitle>
      <VCardText>Gestiona usuarios y configuraciones</VCardText>
    </VCard>

    <!-- Botones condicionales -->
    <VBtn
      v-if="hasPermission('canManageGraduates')"
      color="primary"
    >
      Gestionar Graduados
    </VBtn>
  </div>
</template>
```

## Mejores Prácticas

1. **Siempre verificar roles en el frontend y backend**
2. **Usar el componente RoleGuard para elementos condicionales**
3. **Aplicar middleware de roles a páginas sensibles**
4. **Manejar estados de carga cuando el usuario aún no esté disponible**
5. **Proporcionar mensajes claros cuando no se tienen permisos**

## Solución de Problemas

### El usuario no tiene rol después del login
- Verificar que el servicio `/me` esté retornando el campo `role`
- Verificar que `fetchUser()` se esté llamando después del login exitoso

### Los elementos de navegación no se filtran
- Verificar que los elementos tengan la propiedad `requiredRoles`
- Verificar que el usuario tenga un rol válido

### Middleware de roles no funciona
- Verificar que la página tenga `middleware: ['auth', 'role']`
- Verificar que el usuario esté autenticado antes de verificar roles 
