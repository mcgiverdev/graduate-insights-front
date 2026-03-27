<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  MyJobOfferFormDialog,
  MyJobOfferTable,
  useMyJobOfferEditor,
  useMyJobOfferForm,
  useMyJobOfferList,
} from '@/src/features/my-job-offers'

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

const isConfirmVisible = ref(false)
const jobOfferIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedJobOffer,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useMyJobOfferEditor({
  fetchMyJobOffers,
  saveMyJobOffer,
  clearServerErrors,
})

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
