<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import type { Director, DirectorFormValues } from '../types'
import { createDirectorFormSchema } from '../validation/directorFormSchema'
import { toFormValues } from '../utils/mappers'

interface Props {
  modelValue: boolean
  director?: Director | null
  submitting: boolean
  serverErrors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: DirectorFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<DirectorFormValues> | null>(null)
const showPasswordField = ref(false)

const isEdit = computed(() => !!props.director)
const dialogTitle = computed(() => isEdit.value ? 'Editar Director' : 'Nuevo Director')
const validationSchema = computed(() => createDirectorFormSchema(isEdit.value))

const genderOptions = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
]

const cargoOptions = [
  'Director de escuela',
  'Presidente de comisión',
  'Decano',
]

const computedInitialValues = computed(() => toFormValues(props.director))

watch(() => props.modelValue, isOpen => {
  if (isOpen) {
    showPasswordField.value = false
    formRef.value?.resetForm({ values: computedInitialValues.value })
  }
})

watch(() => props.director, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof DirectorFormValues, message)
  })
})

const handleSubmit = (values: DirectorFormValues) => {
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
                name="cargo"
                v-slot="{ field, errorMessage }"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="cargoOptions"
                  label="Cargo *"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol v-if="!isEdit || showPasswordField" cols="12" md="6">
              <Field
                name="contrasena"
                v-slot="{ field, errorMessage }"
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

            <VCol v-if="isEdit && !showPasswordField" cols="12" md="6">
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
