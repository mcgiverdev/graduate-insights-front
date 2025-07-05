import { computed, ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface UserData {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
  verified: boolean
}

const user = ref<UserData | null>(null)
const loading = ref(false)

export const useUser = () => {
  const fetchUser = async () => {
    loading.value = true
    try {
      const response = await useApi('/graduate-insights/v1/api/auth/me')
      if (response.data?.success)
        user.value = response.data.data
    }
    catch (error) {
      console.error('Error fetching user:', error)
      user.value = null
    }
    finally {
      loading.value = false
    }
  }

  const initials = computed(() => {
    if (!user.value?.name)
      return ''

    return user.value.name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  const role = computed(() => user.value?.role || null)

  const isRole = (roleToCheck: string) => {
    return role.value === roleToCheck
  }

  const hasAnyRole = (roles: string[]) => {
    return role.value && roles.includes(role.value)
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    loading,
    fetchUser,
    initials,
    role,
    isRole,
    hasAnyRole,
    clearUser,
  }
}
