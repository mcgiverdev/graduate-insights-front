<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { Graduate, GraduateFormValues } from '../types'
import { graduateFormSchema } from '../validation/graduateFormSchema'
import { toFormValues } from '../utils/mappers'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'

interface Props {
  modelValue: boolean
  graduate?: Graduate | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: GraduateFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<GraduateFormValues> | null>(null)

const dialogTitle = computed(() => props.graduate ? 'Editar Graduado' : 'Nuevo Graduado')
const isEditMode = computed(() => Boolean(props.graduate))

const genderOptions = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

const computedInitialValues = computed(() => toFormValues(props.graduate))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.graduate, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof GraduateFormValues, message)
  })
})

const handleSubmit = (values: GraduateFormValues) => {
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
          :validation-schema="graduateFormSchema"
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
                name="nombres"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Nombres"
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
                name="apellidos"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Apellidos"
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
                name="correo"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Correo electrónico"
                  type="email"
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
                name="dni"
              >
                <AppTextField
                  :model-value="field.value"
                  label="DNI"
                  maxlength="8"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <VAlert
                type="info"
                variant="tonal"
                density="compact"
              >
                La contrasena inicial de la cuenta sera el DNI registrado.
              </VAlert>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="celular"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Celular"
                  maxlength="9"
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
                name="genero"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="genderOptions"
                  label="Género"
                  item-title="title"
                  item-value="value"
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
                name="fechaNacimiento"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de nacimiento"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              v-if="isEditMode"
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="fechaInicio"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de inicio"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              v-if="isEditMode"
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="fechaFin"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de fin"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              v-if="isEditMode"
              cols="12"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="cvPath"
              >
                <AppFileField
                  :model-value="field.value"
                  label="Archivo CV"
                  accept=".pdf,.doc,.docx"
                  placeholder="Adjunta el CV en formato PDF"
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
