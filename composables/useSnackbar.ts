import { ref } from 'vue'

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
})

export const useSnackbar = () => {
  const showSnackbar = ({ text, color = 'success' }: { text: string; color?: string }) => {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout: 3000,
    }
  }

  return {
    showSnackbar,
    snackbar,
  }
}
