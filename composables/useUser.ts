import { computed, ref } from 'vue'
import { useApi } from '@/composables/useApi'

const user = ref<any>(null)
const loading = ref(false)

export const useUser = () => {
  const fetchUser = async () => {
    loading.value = true
    try {
      const response = await useApi('/graduate-insights/v1/api/auth/me')
      if (response.success)
        user.value = response.data
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
      .join('')
      .toUpperCase()
  })

  return {
    user,
    loading,
    fetchUser,
    initials,
  }
}
