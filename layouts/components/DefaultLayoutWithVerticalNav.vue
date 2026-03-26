<script lang="ts" setup>
import { computed } from 'vue'
import { useRoles } from '@/composables/useRoles'
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'
import TheCustomizer from '@core/components/TheCustomizer.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const { hasAnyRole, role } = useRoles()

function filterItems(items: any[]): any[] {
  return items.reduce((acc: any[], item: any) => {
    if (item.requiredRoles && !hasAnyRole(item.requiredRoles))
      return acc

    if (item.children) {
      const filteredChildren = filterItems(item.children)
      if (filteredChildren.length > 0)
        acc.push({ ...item, children: filteredChildren })
      return acc
    }

    acc.push(item)
    return acc
  }, [])
}

const filteredNavItems = computed(() => {
  if (!role.value)
    return []
  return filterItems(navItems)
})
</script>

<template>
  <VerticalNavLayout :nav-items="filteredNavItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </VerticalNavLayout>
</template>
