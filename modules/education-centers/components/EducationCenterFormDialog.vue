<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { EducationCenter, EducationCenterFormValues } from '../types'
import { educationCenterFormSchema } from '../validation/educationCenterFormSchema'
import { toFormValues } from '../utils/mappers'

interface Props {
  modelValue: boolean
  educationCenter?: EducationCenter | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: EducationCenterFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<EducationCenterFormValues> | null>(null)

const dialogTitle = computed(() => props.educationCenter ? 'Editar Centro Educativo' : 'Nuevo Centro Educativo')

const computedInitialValues = computed(() => toFormValues(props.educationCenter))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.educationCenter, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof EducationCenterFormValues, message)
  })
})

const handleSubmit = (values: EducationCenterFormValues) => {
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
          :validation-schema="educationCenterFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <Field
            name="nombre"
            v-slot="{ field, errorMessage }"
          >
            <AppTextField
              :model-value="field.value"
              label="Nombre"
              placeholder="Nombre del centro educativo"
              :error-messages="errorMessage"
              @update:model-value="field.onChange"
            />
          </Field>

          <Field
            name="direccion"
            v-slot="{ field, errorMessage }"
          >
            <AppTextField
              :model-value="field.value"
              label="Dirección"
              placeholder="Dirección del centro"
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
