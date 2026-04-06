<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  modelValue: boolean
  responses: string[]
  questionText: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const searchQuery = ref('')
const page = ref(1)
const itemsPerPage = 10

const filteredResponses = computed(() => {
  if (!searchQuery.value.trim())
    return props.responses
  const query = searchQuery.value.toLowerCase()

  return props.responses.filter(r => r.toLowerCase().includes(query))
})

const totalPages = computed(() => Math.ceil(filteredResponses.value.length / itemsPerPage))

const paginatedResponses = computed(() => {
  const start = (page.value - 1) * itemsPerPage

  return filteredResponses.value.slice(start, start + itemsPerPage)
})

watch(searchQuery, () => {
  page.value = 1
})

const close = () => emit('update:modelValue', false)
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Todas las respuestas</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="close"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardSubtitle class="pb-0">
        {{ questionText }}
      </VCardSubtitle>

      <VCardText>
        <AppTextField
          v-model="searchQuery"
          placeholder="Buscar en respuestas..."
          prepend-inner-icon="tabler-search"
          class="mb-4"
          clearable
        />

        <div class="text-caption text-medium-emphasis mb-3">
          {{ filteredResponses.length }} respuestas encontradas
        </div>

        <VList
          v-if="paginatedResponses.length > 0"
          lines="three"
        >
          <VListItem
            v-for="(response, index) in paginatedResponses"
            :key="index"
          >
            <template #prepend>
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
              </VAvatar>
            </template>
            <VListItemTitle class="text-body-2 text-wrap">
              "{{ response }}"
            </VListItemTitle>
            <VListItemSubtitle class="text-caption">
              {{ response.length }} caracteres
            </VListItemSubtitle>
          </VListItem>
        </VList>

        <VAlert
          v-else
          type="info"
          variant="tonal"
        >
          No se encontraron respuestas que coincidan con la búsqueda.
        </VAlert>

        <div
          v-if="totalPages > 1"
          class="d-flex justify-center mt-4"
        >
          <VPagination
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            size="small"
          />
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
