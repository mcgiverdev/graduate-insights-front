<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'
import type { Graduate, GraduateFormValues } from '../types'
import { graduateFormSchema } from '../validation/graduateFormSchema'
import { toFormValues } from '../utils/mappers'

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
            <VCol cols="12" md="6">
              <Field
                name="nombres"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Nombres"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="apellidos"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Apellidos"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field
                name="correo"
                v-slot="{ field, errorMessage }"
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

            <VCol cols="12" md="6">
              <Field
                name="dni"
                v-slot="{ field, errorMessage }"
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

            <VCol cols="12" md="6">
              <Field
                name="celular"
                v-slot="{ field, errorMessage }"
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

            <VCol cols="12" md="6">
              <Field
                name="genero"
                v-slot="{ field, errorMessage }"
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

            <VCol cols="12" md="6">
              <Field
                name="fechaNacimiento"
                v-slot="{ field, errorMessage }"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha de nacimiento"
                  :config="{ dateFormat: 'Y-m-d' }"
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

            <VCol cols="12" md="6">
              <Field
                name="contrasena"
                v-slot="{ field, errorMessage }"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Contraseña"
                  type="password"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field
                name="cvPath"
                v-slot="{ field, errorMessage }"
              >
                <AppFileField
                  :model-value="field.value"
                  label="Archivo CV"
                  accept=".pdf,.doc,.docx"
                  placeholder="Adjunta el CV en formato PDF"
                  :error-messages="errorMessage"
                  required
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
