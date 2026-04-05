<script setup lang="ts">
import { useForm } from 'vee-validate'
import { computed, ref, toRaw, watch } from 'vue'
import * as yup from 'yup'
import type { FieldType } from '../types/FieldType'
import type { FieldDefinition, ModelDefinition } from '../types/ModelDefinition'
import AppBelongsField from '@/@core/components/app-form-elements/AppBelongsField.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface FormGeneratorProps {
  modelDefinition: ModelDefinition
  initialData?: Record<string, any> | null
  mode?: 'create' | 'edit'
  serverErrors?: Record<string, string>
}

const props = withDefaults(defineProps<FormGeneratorProps>(), {
  initialData: () => ({}),
  mode: 'create',
  serverErrors: () => ({}),
})

const emit = defineEmits<{ (e: 'submit', values: Record<string, any>): void; (e: 'cancel'): void }>()

const hasAttemptedSubmit = ref(false)
const serverErrorBag = ref<Record<string, string>>({})

const fieldEntries = computed(() => Object.entries(props.modelDefinition.fields))
const fieldNames = computed(() => fieldEntries.value.map(([name]) => name))

const visibleFields = computed(() =>
  fieldEntries.value.filter(([_, field]) => {
    const config = props.mode === 'create' ? field.create : field.edit

    return config?.visible !== false
  }),
)

const normalizeFieldName = (rawName: string): string | null => {
  if (fieldNames.value.includes(rawName))
    return rawName

  const snakeCase = rawName.replace(/([A-Z])/g, '_$1').toLowerCase()
  if (fieldNames.value.includes(snakeCase))
    return snakeCase

  const camelCase = rawName.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  if (fieldNames.value.includes(camelCase))
    return camelCase

  return null
}

const buildInitialValues = () => {
  const values: Record<string, any> = {}

  fieldEntries.value.forEach(([name, field]) => {
    const defaultValue = props.mode === 'create'
      ? field.create?.defaultValue
      : props.initialData?.[name]

    const fallback = field.type === 'file' ? null : ''

    values[name] = props.initialData?.[name] ?? defaultValue ?? fallback
  })

  return values
}

const buildValidationSchema = () => {
  const schema: Record<string, any> = {}

  visibleFields.value.forEach(([name, field]) => {
    const rules = (props.mode === 'create' ? field.create : field.edit)?.rules

    if (!rules || !rules.length)
      return

    let fieldSchema: any

    switch (field.type) {
      case 'date':
      case 'date-time':
        fieldSchema = yup.date()
        break
      case 'time':
        fieldSchema = yup.string()
        break
      case 'number':
        fieldSchema = yup.number()
        break
      case 'belongs':
      case 'file':
        fieldSchema = yup.mixed()
        break
      default:
        fieldSchema = yup.string()
    }

    rules.forEach(rule => {
      if (rule === 'required') {
        fieldSchema = fieldSchema.required('Este campo es requerido')
      }
      else if (rule === 'email' && fieldSchema instanceof yup.StringSchema) {
        fieldSchema = fieldSchema.email('Ingrese un correo electrónico válido')
      }
      else if (rule === 'numeric') {
        fieldSchema = yup.number().typeError('Este campo debe ser numérico')
      }
      else if (rule === 'time' && fieldSchema instanceof yup.StringSchema) {
        fieldSchema = fieldSchema.matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Ingrese una hora válida (HH:mm)')
      }
      else if (rule.startsWith('min:')) {
        const minLength = Number.parseInt(rule.split(':')[1])
        if (fieldSchema instanceof yup.StringSchema)
          fieldSchema = fieldSchema.min(minLength, `Mínimo ${minLength} caracteres`)

        if (fieldSchema instanceof yup.NumberSchema)
          fieldSchema = fieldSchema.min(minLength, `El valor mínimo es ${minLength}`)
      }
    })

    if (fieldSchema instanceof yup.DateSchema)
      fieldSchema = fieldSchema.typeError('Ingrese una fecha válida')

    schema[name] = fieldSchema
  })

  return yup.object().shape(schema)
}

const validationSchema = computed(() => buildValidationSchema())
const initialValues = ref(buildInitialValues())

watch(
  () => [props.initialData, props.mode, props.modelDefinition],
  () => {
    initialValues.value = buildInitialValues()
  },
  { deep: true },
)

const { values, errors, setFieldValue, validate, validateField, setFieldError, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues.value,
  validateOnMount: false,
})

const clearServerErrors = () => {
  const fieldsWithErrors = Object.keys(serverErrorBag.value)

  serverErrorBag.value = {}
  fieldsWithErrors.forEach(name => setFieldError(name, undefined))
}

watch(initialValues, newValues => {
  resetForm({
    values: newValues,
    errors: {},
  })
  hasAttemptedSubmit.value = false
  clearServerErrors()
})

const applyServerErrors = (errorMap: Record<string, string>) => {
  clearServerErrors()

  Object.entries(errorMap).forEach(([rawField, message]) => {
    const normalized = normalizeFieldName(rawField)
    if (!normalized)
      return

    serverErrorBag.value[normalized] = message
    setFieldError(normalized, message)
  })
}

watch(() => props.serverErrors, newErrors => {
  if (newErrors && Object.keys(newErrors).length > 0) {
    hasAttemptedSubmit.value = true
    applyServerErrors(newErrors)
  }
  else {
    clearServerErrors()
  }
}, { immediate: true, deep: true })

const onFieldInput = async (name: string, value: any) => {
  setFieldValue(name, value)

  if (serverErrorBag.value[name]) {
    delete serverErrorBag.value[name]
    setFieldError(name, undefined)
  }

  if (hasAttemptedSubmit.value)
    await validateField(name)
}

const onFieldBlur = async (name: string) => {
  if (hasAttemptedSubmit.value)
    await validateField(name)
}

const submitForm = async (event?: Event) => {
  if (event)
    event.preventDefault()

  hasAttemptedSubmit.value = true
  clearServerErrors()

  const validationResult = await validate()
  if (validationResult.valid)
    emit('submit', { ...toRaw(values) })
}

const getFieldComponent = (type: FieldType) => {
  switch (type) {
    case 'enum':
      return AppSelect
    case 'date':
    case 'time':
    case 'date-time':
      return AppDateTimePicker
    case 'belongs':
      return AppBelongsField
    case 'file':
      return AppFileField
    default:
      return AppTextField
  }
}

const getFieldProps = (field: FieldDefinition, fieldName: string) => {
  const fieldProps: Record<string, any> = {
    label: field.label,
    required: field.create?.rules?.includes('required') || field.edit?.rules?.includes('required') || false,
  }

  if (field.placeholder && field.type !== 'file')
    fieldProps.placeholder = field.placeholder

  if (field.type === 'enum' && field.options?.items)
    fieldProps.items = field.options.items

  if (field.type === 'belongs' && field.options?.apiEndpoint) {
    fieldProps.apiEndpoint = field.options.apiEndpoint
    fieldProps.displayField = field.options.displayField || 'value'
    fieldProps.valueField = field.options.valueField || 'key'
  }

  if (field.type === 'file') {
    fieldProps.accept = field.options?.accept || '.pdf'
    fieldProps.maxSize = field.options?.maxSize || 10240
    fieldProps.placeholder = field.placeholder || 'Seleccionar archivo'
  }

  if (fieldName.toLowerCase().includes('password'))
    fieldProps.type = 'password'

  if (field.type === 'time') {
    fieldProps.config = {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
    }
  }
  else if (field.type === 'date-time') {
    fieldProps.config = {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
    }
  }

  return fieldProps
}

const displayError = (fieldName: string): string | undefined => {
  if (serverErrorBag.value[fieldName])
    return serverErrorBag.value[fieldName]

  if (!hasAttemptedSubmit.value)
    return undefined

  return errors.value[fieldName]
}
</script>

<template>
  <form
    novalidate
    @submit.prevent="submitForm"
  >
    <VRow>
      <VCol
        v-for="[name, field] in visibleFields"
        :key="name"
        cols="12"
      >
        <component
          :is="getFieldComponent(field.type)"
          :model-value="values[name]"
          v-bind="getFieldProps(field, name)"
          :error-messages="displayError(name)"
          :error="!!displayError(name)"
          @update:model-value="onFieldInput(name, $event)"
          @blur="onFieldBlur(name)"
        />
      </VCol>
    </VRow>
    <div class="d-flex gap-4 justify-end mt-6">
      <VBtn
        variant="outlined"
        @click="$emit('cancel')"
      >
        Cancelar
      </VBtn>
      <VBtn
        color="primary"
        type="submit"
      >
        Guardar
      </VBtn>
    </div>
  </form>
</template>

<style scoped>
.form-field {
  margin-block-end: 1rem;
}

.form-field label {
  display: block;
  margin-block-end: 0.5rem;
}

.error {
  color: red;
  font-size: 0.875rem;
  margin-block-start: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-block-start: 1rem;
}

:deep(.v-field--error) {
  --v-field-border-width: 2px;
  --v-field-border-opacity: 1;
}

:deep(.v-input__details) {
  color: rgb(var(--v-theme-error));
  padding-inline-start: 16px;
}
</style>
