<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#imports'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  GraduateTable,
  useGraduateList,
} from '@/src/features/graduates'

definePageMeta({
  middleware: ['auth', 'role'],
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
  showOnlyPending,
  setShowOnlyPending,
  deleteGraduate,
  activateGraduate,
} = useGraduateList()

const isConfirmVisible = ref(false)
const graduateIdToDelete = ref<number | null>(null)
const router = useRouter()

const requestDelete = (graduateId: number) => {
  graduateIdToDelete.value = graduateId
  isConfirmVisible.value = true
}

const openGraduateDetail = async (graduateId: number) => {
  await router.push({
    name: 'graduates-id',
    params: { id: graduateId },
  })
}

const openGraduateCreate = async () => {
  await router.push({ name: 'graduates-new' })
}

const openGraduateEdit = async (graduateId: number) => {
  await router.push({
    name: 'graduates-id-edit',
    params: { id: graduateId },
  })
}

const confirmDelete = async () => {
  if (graduateIdToDelete.value === null)
    return

  await deleteGraduate(graduateIdToDelete.value)
  isConfirmVisible.value = false
  graduateIdToDelete.value = null
}
</script>

<template>
  <section>
    <GraduateTable
      :items="items"
      :loading="loading"
      :page="pagination.page"
      :items-per-page="pagination.itemsPerPage"
      :total-items="pagination.totalItems"
      :search="search"
      :show-only-pending="showOnlyPending"
      @update:page="setPage"
      @update:items-per-page="setItemsPerPage"
      @update:search="setSearch"
      @update:show-only-pending="setShowOnlyPending"
      @create="openGraduateCreate"
      @view="openGraduateDetail"
      @edit="openGraduateEdit"
      @delete="requestDelete"
      @activate="activateGraduate"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar graduado"
      text="¿Seguro que deseas eliminar este graduado? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
