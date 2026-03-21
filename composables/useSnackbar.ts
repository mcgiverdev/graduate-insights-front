import { ref } from 'vue'

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
})

export const useSnackbar = () => {
  // Sobrecarga para soportar ambos patrones
  const showSnackbar = (textOrOptions: string | { text: string; color?: string }, color: string = 'success') => {
    if (typeof textOrOptions === 'string') {
      // Patrón: showSnackbar(message, type)
      snackbar.value = {
        show: true,
        text: textOrOptions,
        color,
        timeout: 3000,
      }
    }
    else {
      // Patrón: showSnackbar({ text, color })
      snackbar.value = {
        show: true,
        text: textOrOptions.text,
        color: textOrOptions.color || 'success',
        timeout: 3000,
      }
    }
  }

  return {
    showSnackbar,
    snackbar,
  }
}
