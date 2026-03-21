<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo } from '#imports'
import { useAuthService } from '@/composables/useAuthService'
import { useUser } from '@/composables/useUser'

const { user, fetchUser, initials } = useUser()
const { logout } = useAuthService()

const goToProfile = () => {
  navigateTo('/profile')
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <span
        v-if="!user?.avatar && initials"
        style=" font-size: 1.2rem;font-weight: bold;"
      >{{ initials }}</span>
      <VImg
        v-else
        :src="user?.avatar"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <span
                      v-if="!user?.avatar && initials"
                      style=" font-size: 1.2rem;font-weight: bold;"
                    >{{ initials }}</span>
                    <VImg
                      v-else
                      :src="user?.avatar"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ user?.name || 'Usuario' }}
            </VListItemTitle>
            <VListItemSubtitle>{{ user?.email || '' }}</VListItemSubtitle>
            <VListItemSubtitle
              v-if="user?.role"
              class="text-primary"
            >
              {{ user.role }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem
            link
            @click="goToProfile"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-user"
                size="22"
              />
            </template>

            <VListItemTitle>Mi Perfil</VListItemTitle>
          </VListItem>

          <!--          &lt;!&ndash; 👉 Settings &ndash;&gt; -->
          <!--          <VListItem link> -->
          <!--            <template #prepend> -->
          <!--              <VIcon -->
          <!--                class="me-2" -->
          <!--                icon="tabler-settings" -->
          <!--                size="22" -->
          <!--              /> -->
          <!--            </template> -->

          <!--            <VListItemTitle>Settings</VListItemTitle> -->
          <!--          </VListItem> -->

          <!--          &lt;!&ndash; 👉 Pricing &ndash;&gt; -->
          <!--          <VListItem link> -->
          <!--            <template #prepend> -->
          <!--              <VIcon -->
          <!--                class="me-2" -->
          <!--                icon="tabler-currency-dollar" -->
          <!--                size="22" -->
          <!--              /> -->
          <!--            </template> -->

          <!--            <VListItemTitle>Pricing</VListItemTitle> -->
          <!--          </VListItem> -->

          <!--          &lt;!&ndash; 👉 FAQ &ndash;&gt; -->
          <!--          <VListItem link> -->
          <!--            <template #prepend> -->
          <!--              <VIcon -->
          <!--                class="me-2" -->
          <!--                icon="tabler-help" -->
          <!--                size="22" -->
          <!--              /> -->
          <!--            </template> -->

          <!--            <VListItemTitle>FAQ</VListItemTitle> -->
          <!--          </VListItem> -->

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Cerrar Sesión</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
