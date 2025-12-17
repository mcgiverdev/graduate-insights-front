<script setup lang="ts">
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { Graduate } from '../types'

interface Props {
  items: Graduate[]
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
  (e: 'edit', graduateId: number): void
  (e: 'delete', graduateId: number): void
}>()

const headers = [
  { title: 'ID', key: 'graduateId' },
  { title: 'DNI', key: 'dni' },
  { title: 'Nombres', key: 'nombres' },
  { title: 'Apellidos', key: 'apellidos' },
  { title: 'Correo', key: 'correo' },
  { title: 'Celular', key: 'celular' },
  { title: 'Inicio', key: 'fechaInicio' },
  { title: 'Fin', key: 'fechaFin' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const perPageOptions = [10, 25, 50]

const onSearchInput = (value: string) => {
  emit('update:search', value)
}

const formatDate = (value?: string | null) => {
  if (!value)
    return '-'

  const normalized = value.trim()
  if (!normalized)
    return '-'

  const [datePart] = normalized.split(/[T ]/)
  return datePart || normalized
}

const getRowGraduateId = (tableItem: { raw?: Graduate | null }): number | null => {
  const rawValue = tableItem?.graduateId
  if (rawValue === undefined || rawValue === null)
    return null

  const numericValue = Number(rawValue)
  return Number.isFinite(numericValue) ? numericValue : null
}

const handleEditClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('edit', graduateId)
}

const handleDeleteClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('delete', graduateId)
}
</script>

<template>
  <VCard>
    <VCardItem>
      <template #title>
        Administración de Graduados
      </template>
    </VCardItem>

    <VDivider />

    <VCardText class="d-flex flex-wrap gap-4 align-center">
      <AppTextField
        :model-value="props.search"
        placeholder="Buscar graduados"
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
        Nuevo Graduado
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
      <template #item.graduateId="{ value }">
        <span class="text-body-2 font-weight-medium">
          {{ value ?? '-' }}
        </span>
      </template>

      <template #item.fechaInicio="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #item.fechaFin="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            icon
            variant="text"
            size="small"
            :disabled="getRowGraduateId(item) === null"
            @click="handleEditClick(item)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            :disabled="getRowGraduateId(item) === null"
            @click="handleDeleteClick(item)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </template>
    </VDataTableServer>
  </VCard>
</template>
