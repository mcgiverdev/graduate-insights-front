<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import MyJobOfferFormDialog from '@/modules/my-job-offers/components/MyJobOfferFormDialog.vue'
import MyJobOfferTable from '@/modules/my-job-offers/components/MyJobOfferTable.vue'
import { useMyJobOfferForm } from '@/modules/my-job-offers/composables/useMyJobOfferForm'
import { useMyJobOfferList } from '@/modules/my-job-offers/composables/useMyJobOfferList'
import type { MyJobOffer, MyJobOfferFormValues } from '@/modules/my-job-offers/types'
import { toPayload } from '@/modules/my-job-offers/utils/mappers'
import { myJobOfferService } from '@/modules/my-job-offers/services/MyJobOfferService'

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
  deleteMyJobOffer,
  fetchMyJobOffers,
} = useMyJobOfferList()

const { submitting, serverErrors, saveMyJobOffer, clearServerErrors } = useMyJobOfferForm()

const isFormVisible = ref(false)
const selectedJobOffer = ref<MyJobOffer | null>(null)
const isConfirmVisible = ref(false)
const jobOfferIdToDelete = ref<number | null>(null)
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

const requestDelete = (jobOfferId: number) => {
  jobOfferIdToDelete.value = jobOfferId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (jobOfferIdToDelete.value === null)
    return

  await deleteMyJobOffer(jobOfferIdToDelete.value)
  isConfirmVisible.value = false
  jobOfferIdToDelete.value = null
}
</script>

<template>
  <section>
    <MyJobOfferTable
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

    <MyJobOfferFormDialog
      v-model="isFormVisible"
      :job-offer="selectedJobOffer"
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
