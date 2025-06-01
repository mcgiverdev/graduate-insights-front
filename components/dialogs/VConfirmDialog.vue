<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  text: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="val => emit('update:modelValue', val)"
  >
    <VCard>
      <VCardTitle class="text-h5">
        {{ title }}
      </VCardTitle>

      <VCardText>
        {{ text }}
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          variant="text"
          @click="handleCancel"
        >
          {{ cancelText || 'Cancelar' }}
        </VBtn>
        <VBtn
          color="error"
          @click="handleConfirm"
        >
          {{ confirmText || 'Confirmar' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
