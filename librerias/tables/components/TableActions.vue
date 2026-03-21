<script setup lang="ts">
import type { TableActions } from '../types'

interface Props {
  actions: TableActions
  item: any
}

defineProps<Props>()
</script>

<template>
  <div class="d-flex align-center justify-end">
    <VBtn
      v-if="actions?.edit"
      icon
      size="small"
      color="primary"
      @click="actions.edit(item)"
    >
      <VIcon icon="tabler-edit" />
    </VBtn>
    <VBtn
      v-if="actions?.delete"
      icon
      size="small"
      color="error"
      class="ms-2"
      @click="actions.delete(item)"
    >
      <VIcon icon="tabler-trash" />
    </VBtn>
    <template v-if="actions?.custom">
      <VBtn
        v-for="(action, actionIndex) in actions.custom"
        :key="actionIndex"
        icon
        size="small"
        :color="action.color"
        class="ms-2"
        @click="action.onClick(item)"
      >
        <VIcon :icon="action.icon" />
      </VBtn>
    </template>
  </div>
</template>
