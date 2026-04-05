<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { EventType, EventTypeFormValues } from '../types'
import { eventTypeFormSchema } from '../validation/eventTypeFormSchema'
import { toFormValues } from '../utils/mappers'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  modelValue: boolean
  eventType?: EventType | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: EventTypeFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<EventTypeFormValues> | null>(null)

const dialogTitle = computed(() => props.eventType ? 'Editar Tipo de Evento' : 'Nuevo Tipo de Evento')

const computedInitialValues = computed(() => toFormValues(props.eventType))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.eventType, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof EventTypeFormValues, message)
  })
})

const handleSubmit = (values: EventTypeFormValues) => {
  emit('submit', values)
}

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('closed')
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="560"
    persistent
    @update:model-value="value => (value ? emit('update:modelValue', value) : closeDialog())"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ dialogTitle }}</span>
        <VBtn
          icon="tabler-x"
          variant="text"
          @click="closeDialog"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <Form
          ref="formRef"
          :validation-schema="eventTypeFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <Field
            v-slot="{ field, errorMessage }"
            name="nombre"
          >
            <AppTextField
              :model-value="field.value"
              label="Nombre"
              placeholder="Nombre del tipo de evento"
              :error-messages="errorMessage"
              @update:model-value="field.onChange"
            />
          </Field>

          <VCardActions class="justify-end mt-6">
            <VBtn
              variant="tonal"
              color="secondary"
              @click="closeDialog"
            >
              Cancelar
            </VBtn>
            <VBtn
              color="primary"
              type="submit"
              :loading="submitting"
            >
              Guardar
            </VBtn>
          </VCardActions>
        </Form>
      </VCardText>
    </VCard>
  </VDialog>
</template>
