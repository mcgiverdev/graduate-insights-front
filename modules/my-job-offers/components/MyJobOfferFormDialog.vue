<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { MyJobOffer, MyJobOfferFormValues } from '../types'
import { myJobOfferFormSchema } from '../validation/myJobOfferFormSchema'
import { toFormValues } from '../utils/mappers'

interface Props {
  modelValue: boolean
  jobOffer?: MyJobOffer | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: MyJobOfferFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<MyJobOfferFormValues> | null>(null)

const dialogTitle = computed(() => props.jobOffer ? 'Editar Oferta' : 'Nueva Oferta')

const statusOptions = [
  { title: 'Activo', value: '1' },
  { title: 'Inactivo', value: '0' },
]

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
    formRef.value?.setFieldError(field as keyof MyJobOfferFormValues, message)
  })
})

const handleSubmit = (values: MyJobOfferFormValues) => {
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
          :validation-schema="myJobOfferFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <VRow>
            <VCol cols="12" md="6">
              <Field
                name="titulo"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Título"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="estado"
                v-slot="{ field, errorMessage }"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="statusOptions"
                  label="Estado"
                  item-title="title"
                  item-value="value"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="link"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Enlace"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field
                name="descripcion"
                v-slot="{ field, errorMessage }"
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
