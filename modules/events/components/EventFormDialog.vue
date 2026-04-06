<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { Event, EventFormValues } from '../types'
import { eventFormSchema } from '../validation/eventFormSchema'
import { toFormValues } from '../utils/mappers'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

interface Props {
  modelValue: boolean
  event?: Event | null
  directorOptions: KeyValueOption[]
  eventTypeOptions: KeyValueOption[]
  submitting: boolean
  serverErrors: Record<string, string>
  optionsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  optionsLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', values: EventFormValues): void
  (e: 'closed'): void
}>()

const formRef = ref<FormContext<EventFormValues> | null>(null)

const dialogTitle = computed(() => props.event ? 'Editar Evento' : 'Nuevo Evento')

const computedInitialValues = computed(() => toFormValues(props.event))

watch(() => props.modelValue, isOpen => {
  if (isOpen)
    formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.event, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

watch(() => props.serverErrors, errors => {
  if (!formRef.value)
    return

  formRef.value.setErrors({})
  Object.entries(errors).forEach(([field, message]) => {
    formRef.value?.setFieldError(field as keyof EventFormValues, message)
  })
})

const handleSubmit = (values: EventFormValues) => {
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
          :validation-schema="eventFormSchema"
          :initial-values="computedInitialValues"
          @submit="handleSubmit"
        >
          <VRow>
            <VCol
              cols="12"
              md="12"
            >
              <Field
                v-slot="{ field, errorMessage }"
                name="nombre"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Nombre"
                  :error-messages="errorMessage"
                  @update:model-value="field.onChange"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field
                v-slot="{ field, errorMessage }"
                name="contenido"
              >
                <VTextarea
                  :model-value="field.value"
                  label="Contenido"
                  auto-grow
                  rows="4"
                  variant="outlined"
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
                name="fechaEvento"
              >
                <AppDateTimePicker
                  :model-value="field.value"
                  label="Fecha del evento *"
                  :config="{ dateFormat: 'Y-m-d' }"
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
                name="enlaceInscripcion"
              >
                <AppTextField
                  :model-value="field.value"
                  label="Enlace de inscripción"
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
                name="directorId"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="directorOptions"
                  :loading="optionsLoading"
                  label="Director"
                  item-title="value"
                  item-value="key"
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
                name="eventTypeId"
              >
                <AppSelect
                  :model-value="field.value"
                  :items="eventTypeOptions"
                  :loading="optionsLoading"
                  label="Tipo de evento"
                  item-title="value"
                  item-value="key"
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
