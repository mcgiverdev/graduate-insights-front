<script setup lang="ts">
import { PasswordChangeCard, ProfileDetailsForm } from '@/src/features/profile'
import { useUser } from '@/composables/useUser'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
  title: 'Mi Perfil',
})

const { user, avatarUrl } = useUser()

const activeTab = ref('perfil')

const genderLabel = computed(() => {
  if (user.value?.genero === 'M') return 'Masculino'
  if (user.value?.genero === 'F') return 'Femenino'
  return 'No especificado'
})

const roleIcon = computed(() => {
  const role = user.value?.role?.toLowerCase() || ''
  if (role.includes('director')) return 'tabler-shield-check'
  if (role.includes('employer') || role.includes('empleador')) return 'tabler-building'
  if (role.includes('graduate') || role.includes('graduado')) return 'tabler-school'
  return 'tabler-user'
})
</script>

<template>
  <div>
    <!-- Banner + Avatar + Info -->
    <VCard class="mb-6 profile-header-card" elevation="0">
      <!-- Banner -->
      <div class="profile-banner">
        <div class="profile-banner-circle profile-banner-circle--1" />
        <div class="profile-banner-circle profile-banner-circle--2" />
        <div class="profile-banner-circle profile-banner-circle--3" />
      </div>

      <!-- Avatar + Info Row -->
      <div class="profile-info-row px-6 pb-5">
        <div class="profile-avatar-wrapper">
          <VAvatar
            size="120"
            class="profile-avatar"
            color="primary"
          >
            <VImg
              v-if="avatarUrl"
              :src="avatarUrl"
              cover
            />
            <span
              v-else
              class="text-h4 font-weight-bold text-white"
            >
              {{ user?.name?.charAt(0) }}
            </span>
          </VAvatar>
        </div>

        <div class="profile-meta d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 pt-2 ms-sm-4">
          <div>
            <h5 class="text-h5 font-weight-bold mb-1">
              {{ user?.name || '—' }}
            </h5>
            <div class="d-flex flex-wrap gap-4 text-body-2 text-medium-emphasis">
              <span class="d-flex align-center gap-1">
                <VIcon :icon="roleIcon" size="16" />
                {{ user?.role || '—' }}
              </span>
              <span class="d-flex align-center gap-1">
                <VIcon icon="tabler-mail" size="16" />
                {{ user?.email || '—' }}
              </span>
              <span class="d-flex align-center gap-1">
                <VIcon icon="tabler-gender-bigender" size="16" />
                {{ genderLabel }}
              </span>
            </div>
          </div>

          <VChip
            color="success"
            size="small"
            variant="tonal"
            class="mt-3 mt-sm-0"
            prepend-icon="tabler-circle-check"
          >
            Verificado
          </VChip>
        </div>
      </div>

      <!-- Tabs -->
      <VTabs
        v-model="activeTab"
        class="profile-tabs px-4"
        color="primary"
      >
        <VTab value="perfil" prepend-icon="tabler-user">
          Mi Perfil
        </VTab>
        <VTab value="seguridad" prepend-icon="tabler-lock">
          Contraseña
        </VTab>
      </VTabs>
    </VCard>

    <!-- Tab Content -->
    <VWindow v-model="activeTab">
      <VWindowItem value="perfil">
        <VRow class="gy-6">
          <VCol cols="12" lg="4">
            <!-- Info card -->
            <VCard elevation="0">
              <VCardItem>
                <VCardTitle class="text-body-1 font-weight-semibold text-uppercase text-medium-emphasis">
                  Acerca de
                </VCardTitle>
              </VCardItem>
              <VCardText class="pt-0">
                <VList lines="one" density="compact" class="pa-0">
                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon icon="tabler-user" size="18" class="me-3 text-medium-emphasis" />
                    </template>
                    <VListItemTitle>
                      <span class="text-medium-emphasis me-2">Nombre:</span>
                      <span class="font-weight-medium">{{ user?.name || '—' }}</span>
                    </VListItemTitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon icon="tabler-mail" size="18" class="me-3 text-medium-emphasis" />
                    </template>
                    <VListItemTitle>
                      <span class="text-medium-emphasis me-2">Correo:</span>
                      <span class="font-weight-medium">{{ user?.email || '—' }}</span>
                    </VListItemTitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon :icon="roleIcon" size="18" class="me-3 text-medium-emphasis" />
                    </template>
                    <VListItemTitle>
                      <span class="text-medium-emphasis me-2">Rol:</span>
                      <span class="font-weight-medium">{{ user?.role || '—' }}</span>
                    </VListItemTitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon icon="tabler-gender-bigender" size="18" class="me-3 text-medium-emphasis" />
                    </template>
                    <VListItemTitle>
                      <span class="text-medium-emphasis me-2">Género:</span>
                      <span class="font-weight-medium">{{ genderLabel }}</span>
                    </VListItemTitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon icon="tabler-circle-check" size="18" class="me-3 text-medium-emphasis" />
                    </template>
                    <VListItemTitle>
                      <span class="text-medium-emphasis me-2">Estado:</span>
                      <VChip color="success" size="x-small" variant="tonal">
                        Activo
                      </VChip>
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" lg="8">
            <ProfileDetailsForm />
          </VCol>
        </VRow>
      </VWindowItem>

      <VWindowItem value="seguridad">
        <VRow class="gy-6">
          <!-- Security info -->
          <VCol cols="12" md="5">
            <VCard elevation="0" height="100%">
              <VCardItem>
                <template #prepend>
                  <VAvatar color="primary" variant="tonal" size="42" class="me-2">
                    <VIcon icon="tabler-shield-lock" size="22" />
                  </VAvatar>
                </template>
                <VCardTitle>Seguridad de cuenta</VCardTitle>
                <VCardSubtitle>Protege tu acceso</VCardSubtitle>
              </VCardItem>
              <VCardText>
                <p class="text-body-2 text-medium-emphasis mb-5">
                  Una contraseña segura protege tu cuenta de accesos no autorizados. Te recomendamos cambiarla periódicamente.
                </p>

                <p class="text-body-2 font-weight-semibold mb-3">
                  Tu contraseña debe tener:
                </p>
                <VList density="compact" class="pa-0 security-tips-list">
                  <VListItem class="px-0 py-1">
                    <template #prepend>
                      <VIcon icon="tabler-check" size="16" color="success" class="me-2" />
                    </template>
                    <VListItemTitle class="text-body-2">Al menos 8 caracteres</VListItemTitle>
                  </VListItem>
                  <VListItem class="px-0 py-1">
                    <template #prepend>
                      <VIcon icon="tabler-check" size="16" color="success" class="me-2" />
                    </template>
                    <VListItemTitle class="text-body-2">Al menos una letra mayúscula</VListItemTitle>
                  </VListItem>
                  <VListItem class="px-0 py-1">
                    <template #prepend>
                      <VIcon icon="tabler-check" size="16" color="success" class="me-2" />
                    </template>
                    <VListItemTitle class="text-body-2">Al menos un número</VListItemTitle>
                  </VListItem>
                  <VListItem class="px-0 py-1">
                    <template #prepend>
                      <VIcon icon="tabler-check" size="16" color="success" class="me-2" />
                    </template>
                    <VListItemTitle class="text-body-2">Al menos un carácter especial</VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Password form -->
          <VCol cols="12" md="7">
            <PasswordChangeCard />
          </VCol>
        </VRow>
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style lang="scss">
.profile-header-card {
  border-radius: 12px !important;
  overflow: visible !important;
}

.profile-banner {
  block-size: 200px;
  background: linear-gradient(120deg, #1a3560 0%, #2a5298 30%, #3a74c0 60%, #5b9fd4 85%, #8ec5e6 100%);
  border-radius: 12px 12px 0 0;
  position: relative;
  overflow: hidden;
}

.profile-banner-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}

.profile-banner-circle--1 {
  inline-size: 280px;
  block-size: 280px;
  inset-block-start: -80px;
  inset-inline-end: 5%;
}

.profile-banner-circle--2 {
  inline-size: 180px;
  block-size: 180px;
  inset-block-end: -60px;
  inset-inline-end: 22%;
  background: rgba(255, 255, 255, 0.05);
}

.profile-banner-circle--3 {
  inline-size: 120px;
  block-size: 120px;
  inset-block-start: 20px;
  inset-inline-end: 38%;
  background: rgba(255, 255, 255, 0.04);
}

.profile-info-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.profile-avatar-wrapper {
  flex-shrink: 0;
  margin-block-start: -60px;
  position: relative;
  z-index: 1;
}

.profile-avatar {
  border: 4px solid white !important;
  box-shadow: 0 4px 16px rgba(48, 91, 168, 0.25) !important;
}

.profile-meta {
  padding-block-end: 0.5rem;
}

.profile-tabs {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-block-start: 1rem;
}

.security-tips-list .v-list-item__prepend {
  min-inline-size: unset !important;
}
</style>
