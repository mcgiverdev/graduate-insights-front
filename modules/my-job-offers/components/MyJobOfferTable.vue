<script setup lang="ts">
import { computed } from 'vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { MyJobOffer } from '../types'

interface Props {
  items: MyJobOffer[]
  loading: boolean
  page: number
  itemsPerPage: number
  totalItems: number
  search: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:items-per-page', value: number): void
  (e: 'update:search', value: string): void
  (e: 'create'): void
  (e: 'edit', jobOfferId: number): void
  (e: 'delete', jobOfferId: number): void
}>()

const headers = [
  { title: 'ID', key: 'jobOfferId' },
  { title: 'Título', key: 'titulo' },
  { title: 'Enlace', key: 'link' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const perPageOptions = [10, 25, 50]

const onSearchInput = (value: string) => {
  emit('update:search', value)
}

const getStatusLabel = (estado?: string) => estado === '1' ? 'Activo' : 'Inactivo'
const getStatusColor = (estado?: string) => estado === '1' ? 'success' : 'error'

const employerInfo = computed(() => {
  const first = props.items[0]
  if (!first?.employerName) return null

  return {
    name: first.employerName,
    ruc: first.employerRuc,
    direccion: first.employerDireccion,
    correo: first.employerCorreo,
  }
})
</script>

<template>
  <VAlert
    v-if="employerInfo"
    type="info"
    variant="tonal"
    class="mb-4"
    icon="tabler-building"
  >
    <div class="d-flex flex-wrap gap-x-6 gap-y-1 align-center">
      <span class="font-weight-semibold">{{ employerInfo.name }}</span>
      <span v-if="employerInfo.ruc" class="text-body-2">
        <strong>RUC:</strong> {{ employerInfo.ruc }}
      </span>
      <span v-if="employerInfo.correo" class="text-body-2">
        <strong>Correo:</strong> {{ employerInfo.correo }}
      </span>
      <span v-if="employerInfo.direccion" class="text-body-2">
        <strong>Direcci&oacute;n:</strong> {{ employerInfo.direccion }}
      </span>
    </div>
  </VAlert>

  <VCard>
    <VCardItem>
      <template #title>
        Mis Ofertas Laborales
      </template>
    </VCardItem>

    <VDivider />

    <VCardText class="d-flex flex-wrap gap-4 align-center">
      <AppTextField
        :model-value="props.search"
        placeholder="Buscar ofertas"
        prepend-inner-icon="tabler-search"
        class="flex-grow-1"
        @update:model-value="onSearchInput"
      />

      <VSelect
        :model-value="props.itemsPerPage"
        :items="perPageOptions"
        label="Por página"
        style="max-inline-size: 8.75rem;"
        @update:model-value="value => emit('update:items-per-page', Number(value))"
      />

      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="emit('create')"
      >
        Nueva Oferta
      </VBtn>
    </VCardText>

    <VDivider />

    <VDataTableServer
      :headers="headers"
      :items="props.items"
      :items-length="props.totalItems"
      :loading="props.loading"
      :items-per-page="props.itemsPerPage"
      :page="props.page"
      class="text-no-wrap"
      @update:page="page => emit('update:page', page)"
      @update:items-per-page="value => emit('update:items-per-page', Number(value))"
    >
      <template #item.jobOfferId="{ item }">
        <span class="text-body-2 font-weight-medium">{{ item?.jobOfferId ?? '-' }}</span>
      </template>

      <template #item.link="{ item }">
        <VBtn
          v-if="item?.link"
          variant="text"
          size="small"
          color="primary"
          :href="item.link"
          target="_blank"
        >
          Ver enlace
        </VBtn>
        <span v-else>-</span>
      </template>

      <template #item.estado="{ item }">
        <VChip
          size="small"
          variant="tonal"
          :color="getStatusColor(item?.estado)"
        >
          {{ getStatusLabel(item?.estado) }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            icon
            variant="text"
            size="small"
            :disabled="!item"
            @click="item && emit('edit', item.jobOfferId)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            :disabled="!item"
            @click="item && emit('delete', item.jobOfferId)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </template>
    </VDataTableServer>
  </VCard>
</template>
