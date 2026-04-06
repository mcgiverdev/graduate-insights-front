<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { JobOffer, JobOfferFormValues } from '../types'
import { jobOfferFormSchema } from '../validation/jobOfferFormSchema'
import { toFormValues } from '../utils/mappers'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

interface Props {
  modelValue: boolean
  jobOffer?: JobOffer | null
  employerOptions: KeyValueOption[]
  submitting: boolean
  serverErrors: Record<string, string>
  optionsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  optionsLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: JobOfferFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<JobOfferFormValues> | null>(null)

const dialogTitle = computed(() => props.jobOffer ? 'Editar Oferta' : 'Nueva Oferta')

const computedInitialValues = computed(() => toFormValues(props.jobOffer))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.jobOffer, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof JobOfferFormValues, message)
  })
})

const handleSubmit = (values: JobOfferFormValues) => {
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
          :validation-schema="jobOfferFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="titulo"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Título"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="link"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Enlace"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="employerId"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="employerOptions"
                  :loading="optionsLoading"
                  label="Empleador"
                  item-title="value"
                  item-value="key"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field
                v-slot="{ field, errorMessage }"
                name="descripcion"
              >
                <VTextarea
                  :model-value="field.value"
                  label="Descripción"
                  auto-grow
                  rows="4"
                  variant="outlined"
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
