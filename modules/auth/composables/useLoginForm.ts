import { reactive, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { authModuleService } from '../services/AuthService'
import type { LoginFormValues, LoginResult } from '../types'

const DEFAULT_VALUES: LoginFormValues = {
  email: 'xmcgiver12@gmail.com',
  password: '123456abC',
  remember: false,
}

export const useLoginForm = () => {
  const form = reactive<LoginFormValues>({ ...DEFAULT_VALUES })
  const loading = ref(false)
  const isPasswordVisible = ref(false)
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (): Promise<LoginResult> => {
    loading.value = true
    try {
      const result = await authModuleService.login(form.email, form.password)
      showSnackbar({ text: result.message, color: result.success ? 'success' : 'error' })
      return result
    }
    finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    isPasswordVisible,
    handleSubmit,
  }
}
