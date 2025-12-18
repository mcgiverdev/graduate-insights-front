<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import type { MyJob, MyJobFormValues } from '../types'
import { myJobFormSchema } from '../validation/myJobFormSchema'
import { toFormValues } from '../utils/mappers'

interface Props {
  modelValue: boolean
  job?: MyJob | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: MyJobFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<MyJobFormValues> | null>(null)

const dialogTitle = computed(() => props.job ? 'Editar Trabajo' : 'Nuevo Trabajo')

const modeOptions = [
  { title: 'Presencial', value: 'Presencial' },
  { title: 'Remoto', value: 'Remoto' },
  { title: 'Híbrido', value: 'Híbrido' },
]

const computedInitialValues = computed(() => toFormValues(props.job))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.job, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof MyJobFormValues, message)
  })
})

const handleSubmit = (values: MyJobFormValues) => {
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
    max-width="720"
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
          :validation-schema="myJobFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <VRow>
            <VCol cols="12" md="6">
              <Field
                name="compania"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Compañía"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="cargo"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Cargo"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="modalidad"
                v-slot="{ field, errorMessage }"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="modeOptions"
                  label="Modalidad"
                  item-title="title"
                  item-value="value"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="fechaInicio"
                v-slot="{ field, errorMessage }"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de inicio"
                  :config="{ dateFormat: 'Y-m-d' }"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="fechaFin"
                v-slot="{ field, errorMessage }"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de fin"
                  :config="{ dateFormat: 'Y-m-d' }"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>
          </VRow>

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
