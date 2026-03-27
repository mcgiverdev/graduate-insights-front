<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  JobOfferFormDialog,
  JobOfferTable,
  useJobOfferEditor,
  useJobOfferForm,
  useJobOfferList,
  useJobOfferOptions,
} from '@/src/features/job-offers'

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

const isConfirmVisible = ref(false)
const jobOfferIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedJobOffer,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useJobOfferEditor({
  fetchJobOffers,
  saveJobOffer,
  clearServerErrors,
  employerOptionsCount: () => employerOptions.value.length,
  loadOptions,
})

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
