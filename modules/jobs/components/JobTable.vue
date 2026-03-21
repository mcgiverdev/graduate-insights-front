<script setup lang="ts">
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { Job } from '../types'

interface Props {
  items: Job[]
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
  (e: 'edit', jobId: number): void
  (e: 'delete', jobId: number): void
}>()

const headers = [
  { title: 'ID', key: 'jobId' },
  { title: 'Graduado', key: 'graduateName' },
  { title: 'Compañía', key: 'compania' },
  { title: 'Cargo', key: 'cargo' },
  { title: 'Modalidad', key: 'modalidad' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const perPageOptions = [10, 25, 50]

const onSearchInput = (value: string) => {
  emit('update:search', value)
}

const getStatusLabel = (estado?: string) => estado === '1' ? 'Activo' : 'Inactivo'
const getStatusColor = (estado?: string) => estado === '1' ? 'success' : 'error'
</script>

<template>
  <VCard>
    <VCardItem>
      <template #title>
        Trabajos
      </template>
    </VCardItem>

    <VDivider />

    <VCardText class="d-flex flex-wrap gap-4 align-center">
      <AppTextField
        :model-value="props.search"
        placeholder="Buscar trabajos"
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
        Nuevo Trabajo
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
      <template #item.jobId="{ item }">
        <span class="text-body-2 font-weight-medium">{{ item?.jobId ?? '-' }}</span>
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
            @click="item && emit('edit', item.jobId)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            :disabled="!item"
            @click="item && emit('delete', item.jobId)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </template>
    </VDataTableServer>
  </VCard>
</template>
