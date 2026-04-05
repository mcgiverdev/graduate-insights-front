<script setup lang="ts">
import { ref, watch } from 'vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  modelValue: boolean
  defaultEmail: string
  sending: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'send', email: string): void
}>()

const testEmail = ref(props.defaultEmail)

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    testEmail.value = props.defaultEmail
})

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>Enviar email de prueba</span>
        <VBtn
          icon="tabler-x"
          variant="text"
          @click="close"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <p class="text-body-2 mb-4">
          Se enviará un correo de prueba para verificar la configuración.
        </p>
        <AppTextField
          v-model="testEmail"
          label="Correo destinatario"
          type="email"
          placeholder="correo@ejemplo.com"
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          @click="close"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          :loading="sending"
          :disabled="!testEmail.trim()"
          @click="emit('send', testEmail.trim())"
        >
          Enviar prueba
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
