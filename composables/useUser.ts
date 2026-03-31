import { computed, ref } from 'vue'
import { useApi } from '@/composables/useApi'

const MALE_AVATARS = [1, 3, 5, 7, 9, 11, 13, 15]
const FEMALE_AVATARS = [2, 4, 6, 8, 10, 12, 14]

function getDefaultAvatar(id: number, genero?: string): string {
  if (genero === 'M') {
    const idx = id % MALE_AVATARS.length
    return `/avatars/avatar-${MALE_AVATARS[idx]}.png`
  }
  if (genero === 'F') {
    const idx = id % FEMALE_AVATARS.length
    return `/avatars/avatar-${FEMALE_AVATARS[idx]}.png`
  }
  return `/avatars/avatar-${(id % 15) + 1}.png`
}

export interface UserData {
  id: number
  name: string
  email: string
  role: string
  genero?: string
  avatar?: string
  verified: boolean
}

const user = ref<UserData | null>(null)
const loading = ref(false)
let fetchPromise: Promise<void> | null = null

export const useUser = () => {
  const setUser = (userData: UserData | null) => {
    user.value = userData
  }

  const fetchUser = async () => {
    // Deduplicar llamadas concurrentes: si ya hay una en vuelo, reusar la misma promesa
    if (fetchPromise)
      return fetchPromise

    loading.value = true
    fetchPromise = useApi('/graduate-insights/v1/api/auth/me')
      .then((response) => {
        if (response.data?.success)
          user.value = response.data.data
      })
      .catch((error) => {
        console.error('Error fetching user:', error)
        user.value = null
      })
      .finally(() => {
        loading.value = false
        fetchPromise = null
      })

    return fetchPromise
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

  const avatarUrl = computed(() => {
    if (user.value?.avatar)
      return user.value.avatar
    if (user.value?.id)
      return getDefaultAvatar(user.value.id, user.value.genero)
    return null
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
    setUser,
    initials,
    avatarUrl,
    role,
    isRole,
    hasAnyRole,
    clearUser,
  }
}
