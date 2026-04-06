<script setup lang="ts">
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES, useRoles } from '@/composables/useRoles'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

const {
  user,
  loading,
  role,
  isAdmin,
  isDirector,
  isEmployer,
  isGraduate,
  permissions,
  hasPermission,
} = useRoles()

const getRoleColor = (currentRole: string) => {
  const colors = {
    Graduado: 'success',
    Empleador: 'info',
    Director: 'warning',
    Administrador: 'error',
  }

  return colors[currentRole] || 'default'
}

const formatPermissionName = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/^Can /, '')
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon
              icon="tabler-shield-check"
              class="me-2"
            />
            Demostración del Sistema de Roles
          </VCardTitle>
          <VCardText>
            Esta página demuestra cómo funciona el sistema de roles y permisos implementado.
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-4">
      <!-- Información del Usuario -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle>Información del Usuario</VCardTitle>
          <VCardText>
            <div v-if="user">
              <p><strong>Nombre:</strong> {{ user.name }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p>
                <strong>Rol:</strong>
                <VChip
                  :color="getRoleColor(user.role)"
                  size="small"
                  class="ms-2"
                >
                  {{ user.role }}
                </VChip>
              </p>
            </div>
            <div v-else-if="loading">
              <VProgressCircular
                indeterminate
                size="24"
              />
              <span class="ms-2">Cargando información del usuario...</span>
            </div>
            <VAlert
              v-else
              type="warning"
            >
              No se pudo cargar la información del usuario
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Verificación de Roles -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle>Verificación de Roles</VCardTitle>
          <VCardText>
            <VList>
              <VListItem>
                <VListItemTitle>¿Es Graduado?</VListItemTitle>
                <template #append>
                  <VIcon
                    :icon="isGraduate ? 'tabler-check' : 'tabler-x'"
                    :color="isGraduate ? 'success' : 'error'"
                  />
                </template>
              </VListItem>
              <VListItem>
                <VListItemTitle>¿Es Empleador?</VListItemTitle>
                <template #append>
                  <VIcon
                    :icon="isEmployer ? 'tabler-check' : 'tabler-x'"
                    :color="isEmployer ? 'success' : 'error'"
                  />
                </template>
              </VListItem>
              <VListItem>
                <VListItemTitle>¿Es Director?</VListItemTitle>
                <template #append>
                  <VIcon
                    :icon="isDirector ? 'tabler-check' : 'tabler-x'"
                    :color="isDirector ? 'success' : 'error'"
                  />
                </template>
              </VListItem>
              <VListItem>
                <VListItemTitle>¿Es Administrador?</VListItemTitle>
                <template #append>
                  <VIcon
                    :icon="isAdmin ? 'tabler-check' : 'tabler-x'"
                    :color="isAdmin ? 'success' : 'error'"
                  />
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Permisos -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle>Permisos del Usuario</VCardTitle>
          <VCardText>
            <VList v-if="permissions">
              <VListItem
                v-for="(value, key) in permissions"
                :key="key"
                :class="value ? 'text-success' : 'text-error'"
              >
                <VListItemTitle>{{ formatPermissionName(key) }}</VListItemTitle>
                <template #append>
                  <VIcon
                    :icon="value ? 'tabler-check' : 'tabler-x'"
                    :color="value ? 'success' : 'error'"
                  />
                </template>
              </VListItem>
            </VList>
            <VAlert
              v-else
              type="info"
            >
              No hay permisos disponibles
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-4">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Componentes Condicionales por Rol</VCardTitle>
          <VCardText>
            <VRow>
              <!-- Solo para Graduados -->
              <VCol
                cols="12"
                md="6"
              >
                <RoleGuard
                  :roles="[ROLES.GRADUADO]"
                  fallback
                >
                  <VAlert
                    type="success"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-graduation-cap"
                      class="me-2"
                    />
                    ¡Bienvenido, Graduado! Aquí puedes responder encuestas.
                  </VAlert>
                  <VBtn
                    color="primary"
                    variant="outlined"
                    block
                  >
                    Ver Mis Encuestas
                  </VBtn>

                  <template #fallback>
                    <VAlert
                      type="info"
                      class="mb-3"
                    >
                      Este contenido es solo para Graduados
                    </VAlert>
                  </template>
                </RoleGuard>
              </VCol>

              <!-- Solo para Empleadores -->
              <VCol
                cols="12"
                md="6"
              >
                <RoleGuard
                  :roles="[ROLES.EMPLEADOR]"
                  fallback
                >
                  <VAlert
                    type="info"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-briefcase"
                      class="me-2"
                    />
                    Panel de Empleador - Busca el mejor talento
                  </VAlert>
                  <VBtn
                    color="info"
                    variant="outlined"
                    block
                  >
                    Buscar Graduados
                  </VBtn>

                  <template #fallback>
                    <VAlert
                      type="info"
                      class="mb-3"
                    >
                      Este contenido es solo para Empleadores
                    </VAlert>
                  </template>
                </RoleGuard>
              </VCol>

              <!-- Solo para Directores y Administradores -->
              <VCol
                cols="12"
                md="6"
              >
                <RoleGuard
                  :roles="[ROLES.DIRECTOR, ROLES.ADMINISTRADOR]"
                  fallback
                >
                  <VAlert
                    type="warning"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-settings"
                      class="me-2"
                    />
                    Panel de Administración - Gestiona el sistema
                  </VAlert>
                  <VBtn
                    color="warning"
                    variant="outlined"
                    block
                  >
                    Panel de Control
                  </VBtn>

                  <template #fallback>
                    <VAlert
                      type="info"
                      class="mb-3"
                    >
                      Este contenido es solo para Directores y Administradores
                    </VAlert>
                  </template>
                </RoleGuard>
              </VCol>

              <!-- Solo para Administradores -->
              <VCol
                cols="12"
                md="6"
              >
                <RoleGuard
                  :roles="[ROLES.ADMINISTRADOR]"
                  fallback
                >
                  <VAlert
                    type="error"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-shield-crown"
                      class="me-2"
                    />
                    Panel de Super Administrador
                  </VAlert>
                  <VBtn
                    color="error"
                    variant="outlined"
                    block
                  >
                    Configuración Avanzada
                  </VBtn>

                  <template #fallback>
                    <VAlert
                      type="info"
                      class="mb-3"
                    >
                      Este contenido es solo para Administradores
                    </VAlert>
                  </template>
                </RoleGuard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-4">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Botones Condicionales por Permisos</VCardTitle>
          <VCardText>
            <div class="d-flex flex-wrap gap-3">
              <VBtn
                v-if="hasPermission('canViewGraduates')"
                color="primary"
                prepend-icon="tabler-users"
              >
                Ver Graduados
              </VBtn>

              <VBtn
                v-if="hasPermission('canManageGraduates')"
                color="secondary"
                prepend-icon="tabler-user-cog"
              >
                Gestionar Graduados
              </VBtn>

              <VBtn
                v-if="hasPermission('canViewEmployers')"
                color="info"
                prepend-icon="tabler-briefcase"
              >
                Ver Empleadores
              </VBtn>

              <VBtn
                v-if="hasPermission('canManageEmployers')"
                color="warning"
                prepend-icon="tabler-briefcase-cog"
              >
                Gestionar Empleadores
              </VBtn>

              <VBtn
                v-if="hasPermission('canManageUsers')"
                color="error"
                prepend-icon="tabler-users-cog"
              >
                Gestionar Usuarios
              </VBtn>

              <VBtn
                v-if="hasPermission('canCreateSurveys')"
                color="success"
                prepend-icon="tabler-clipboard-plus"
              >
                Crear Encuestas
              </VBtn>
            </div>

            <VAlert
              v-if="!role"
              type="warning"
              class="mt-4"
            >
              Debes estar autenticado para ver los botones de permisos
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
