<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import JobOfferFormDialog from '@/modules/job-offers/components/JobOfferFormDialog.vue'
import JobOfferTable from '@/modules/job-offers/components/JobOfferTable.vue'
import { useJobOfferForm } from '@/modules/job-offers/composables/useJobOfferForm'
import { useJobOfferList } from '@/modules/job-offers/composables/useJobOfferList'
import { useJobOfferOptions } from '@/modules/job-offers/composables/useJobOfferOptions'
import type { JobOffer, JobOfferFormValues } from '@/modules/job-offers/types'
import { toPayload } from '@/modules/job-offers/utils/mappers'
import { jobOfferService } from '@/modules/job-offers/services/JobOfferService'

definePageMeta({
  layout: 'default',
})

const {
  items,
  loading,
  search,
  pagination,
  setPage,
  setItemsPerPage,
  setSearch,
  deleteJobOffer,
  fetchJobOffers,
} = useJobOfferList()

const { submitting, serverErrors, saveJobOffer, clearServerErrors } = useJobOfferForm()
const { employerOptions, loadingOptions, loadOptions } = useJobOfferOptions()

const isFormVisible = ref(false)
const selectedJobOffer = ref<JobOffer | null>(null)
const isConfirmVisible = ref(false)
const jobOfferIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const ensureOptionsLoaded = async () => {
  if (!employerOptions.value.length)
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

const requestDelete = (jobOfferId: number) => {
  jobOfferIdToDelete.value = jobOfferId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (jobOfferIdToDelete.value === null)
    return

  await deleteJobOffer(jobOfferIdToDelete.value)
  isConfirmVisible.value = false
  jobOfferIdToDelete.value = null
}
</script>

<template>
  <section>
    <JobOfferTable
      :items="items"
      :loading="loading"
      :page="pagination.page"
      :items-per-page="pagination.itemsPerPage"
      :total-items="pagination.totalItems"
      :search="search"
      @update:page="setPage"
      @update:items-per-page="setItemsPerPage"
      @update:search="setSearch"
      @create="openCreateForm"
      @edit="openEditForm"
      @delete="requestDelete"
    />

    <JobOfferFormDialog
      v-model="isFormVisible"
      :job-offer="selectedJobOffer"
      :employer-options="employerOptions"
      :options-loading="loadingOptions"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar oferta"
      text="¿Seguro que deseas eliminar esta oferta laboral? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
