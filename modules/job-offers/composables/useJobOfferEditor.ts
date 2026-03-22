import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { RequestResult } from '@/infrastructure/http/types'
import { jobOfferService } from '../services/JobOfferService'
import type { JobOffer, JobOfferFormValues, JobOfferPayload } from '../types'
import { toPayload } from '../utils/mappers'

interface UseJobOfferEditorOptions {
  fetchJobOffers: () => Promise<void>
  saveJobOffer: (payload: JobOfferPayload, jobOfferId?: number) => Promise<RequestResult>
  clearServerErrors: () => void
  employerOptionsCount: () => number
  loadOptions: () => Promise<void>
}

export const useJobOfferEditor = ({
  fetchJobOffers,
  saveJobOffer,
  clearServerErrors,
  employerOptionsCount,
  loadOptions,
}: UseJobOfferEditorOptions) => {
  const isFormVisible = ref(false)
  const selectedJobOffer = ref<JobOffer | null>(null)
  const { showSnackbar } = useSnackbar()

  const ensureOptionsLoaded = async () => {
    if (!employerOptionsCount())
      await loadOptions()
  }

  const openCreateForm = async () => {
    await ensureOptionsLoaded()
    selectedJobOffer.value = null
    clearServerErrors()
    isFormVisible.value = true
  }

  const openEditForm = async (jobOfferId: number) => {
    await ensureOptionsLoaded()
    clearServerErrors()
    selectedJobOffer.value = null
    isFormVisible.value = true

    try {
      const offer = await jobOfferService.getById(jobOfferId)

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

  const handleFormSubmit = async (values: JobOfferFormValues) => {
    const payload = toPayload(values)
    const result = await saveJobOffer(payload, selectedJobOffer.value?.jobOfferId)

    if (result.success) {
      isFormVisible.value = false
      selectedJobOffer.value = null
      await fetchJobOffers()
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
