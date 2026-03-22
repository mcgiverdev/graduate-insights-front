import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { myJobOfferService } from '../services/MyJobOfferService'
import type { MyJobOffer, MyJobOfferFormValues, MyJobOfferPayload } from '../types'
import { toPayload } from '../utils/mappers'

interface UseMyJobOfferEditorOptions {
  fetchMyJobOffers: () => Promise<void>
  saveMyJobOffer: (payload: MyJobOfferPayload, jobOfferId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
}

export const useMyJobOfferEditor = ({
  fetchMyJobOffers,
  saveMyJobOffer,
  clearServerErrors,
}: UseMyJobOfferEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedJobOffer = ref<MyJobOffer | null>(null)
  const { showSnackbar } = useSnackbar()

  const openCreateForm = () => {
    selectedJobOffer.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (jobOfferId: number) => {
    clearServerErrors()
    selectedJobOffer.value = null
    isFormVisible.value = true

    try {
      const offer = await myJobOfferService.getById(jobOfferId)

      if (!offer) {
        showSnackbar({ text: 'No se encontró la oferta seleccionada', color: 'error' })
        isFormVisible.value = false
        return
      }

      selectedJobOffer.value = offer
    }
    catch (error) {
      console.error('Error al obtener oferta', error)
      showSnackbar({ text: 'No se pudo cargar la oferta', color: 'error' })
      isFormVisible.value = false
    }
  }

  const handleFormSubmit = async (values: MyJobOfferFormValues) => {
    const payload = toPayload(values)
    const result = await saveMyJobOffer(payload, selectedJobOffer.value?.jobOfferId)

    if (result.success) {
      isFormVisible.value = false
      selectedJobOffer.value = null
      await fetchMyJobOffers()
    }
  }

  const handleDialogClosed = () => {
    clearServerErrors()
    selectedJobOffer.value = null
  }

  return {
    isFormVisible,
    selectedJobOffer,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    handleDialogClosed,
  }
}
