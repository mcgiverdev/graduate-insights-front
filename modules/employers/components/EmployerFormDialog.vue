<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { Employer, EmployerFormValues } from '../types'
import { createEmployerFormSchema } from '../validation/employerFormSchema'
import { toFormValues } from '../utils/mappers'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  modelValue: boolean
  employer?: Employer | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: EmployerFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<EmployerFormValues> | null>(null)
const showPasswordField = ref(false)

const isEdit = computed(() => !!props.employer)
const dialogTitle = computed(() => isEdit.value ? 'Editar Empleador' : 'Nuevo Empleador')
const validationSchema = computed(() => createEmployerFormSchema(isEdit.value))

const computedInitialValues = computed(() => toFormValues(props.employer))

watch(() => props.modelValue, isOpen => {
  if (isOpen) {
    showPasswordField.value = false
    formRef.value?.resetForm({ values: computedInitialValues.value })
  }
})

watch(() => props.employer, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof EmployerFormValues, message)
  })
})

const handleSubmit = (values: EmployerFormValues) => {
  if (isEdit.value && !showPasswordField.value)
    values.contrasena = ''

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
          :validation-schema="validationSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <!-- Datos de la empresa -->
          <div class="text-subtitle-1 font-weight-medium mb-3">
            Datos de la empresa
          </div>

          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="ruc"
              >
                <AppTextField
                  :model-value="field.value"
                  label="RUC *"
                  maxlength="11"
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
                name="razonSocial"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Razón social *"
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
                name="direccion"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Dirección"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field
                v-slot="{ field, errorMessage }"
                name="resumenEmpresa"
              >
                <VTextarea
                  :model-value="field.value"
                  label="Resumen de la empresa"
                  rows="3"
                  maxlength="1000"
                  variant="outlined"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>
          </VRow>

          <!-- Datos del contacto -->
          <div class="text-subtitle-1 font-weight-medium mb-3 mt-4">
            Datos del contacto
          </div>

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
                  label="Nombres *"
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
                  label="Apellidos *"
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
                  label="Correo electrónico *"
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
                name="celular"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Celular *"
                  maxlength="9"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              v-if="!isEdit || showPasswordField"
              cols="12"
              md="6"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="contrasena"
              >
                <AppTextField
                  :model-value="field.value"
                  :label="isEdit ? 'Nueva contraseña' : 'Contraseña *'"
                  type="password"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol
              v-if="isEdit && !showPasswordField"
              cols="12"
              md="6"
            >
              <VBtn
                variant="tonal"
                color="secondary"
                prepend-icon="tabler-lock"
                @click="showPasswordField = true"
              >
                Cambiar contraseña
              </VBtn>
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
