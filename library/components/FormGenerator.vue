<script lang="ts">
import { useForm } from 'vee-validate'
import type { PropType } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import * as yup from 'yup'
import type { FieldType } from '../types/FieldType'
import type { FieldDefinition, ModelDefinition } from '../types/ModelDefinition'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'

export default defineComponent({
  name: 'FormGenerator',
  components: {
    AppTextField,
    AppSelect,
    AppDateTimePicker,
  },

  props: {
    modelDefinition: {
      type: Object as PropType<ModelDefinition>,
      required: true,
    },
    initialData: {
      type: Object as PropType<Record<string, any> | null>,
      default: () => ({}),
    },
    mode: {
      type: String as PropType<'create' | 'edit'>,
      default: 'create',
    },
  },

  emits: ['submit', 'cancel'],

  setup(props, { emit }) {
    const hasAttemptedSubmit = ref(false)

    const visibleFields = computed(() =>
      Object.entries(props.modelDefinition.fields).filter(([_, field]) => {
        const config = props.mode === 'create' ? field.create : field.edit

        return config?.visible !== false
      }),
    )

    const generateValidationSchema = () => {
      const schema: Record<string, any> = {}

      visibleFields.value.forEach(([name, field]) => {
        const config = props.mode === 'create' ? field.create : field.edit
        if (config?.rules) {
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
            case 'numeric':
              fieldSchema = yup.number()
              break
            default:
              fieldSchema = yup.string()
          }

          config.rules.forEach(rule => {
            if (rule === 'required') {
              fieldSchema = fieldSchema.required('Este campo es requerido')
            }
            else if (rule === 'email') {
              if (fieldSchema instanceof yup.StringSchema)
                fieldSchema = fieldSchema.email('Ingrese un correo electrónico válido')
            }
            else if (rule === 'numeric') {
              if (!(fieldSchema instanceof yup.NumberSchema))
                fieldSchema = yup.number().typeError('Este campo debe ser numérico')
            }
            else if (rule === 'time') {
              if (fieldSchema instanceof yup.StringSchema)
                fieldSchema = fieldSchema.matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Ingrese una hora válida (HH:mm)')
            }
            else if (rule.startsWith('min:')) {
              const minLength = Number.parseInt(rule.split(':')[1])
              if (fieldSchema instanceof yup.StringSchema)
                fieldSchema = fieldSchema.min(minLength, `Mínimo ${minLength} caracteres`)

              else if (fieldSchema instanceof yup.NumberSchema)
                fieldSchema = fieldSchema.min(minLength, `El valor mínimo es ${minLength}`)
            }
          })

          if (fieldSchema instanceof yup.DateSchema)
            fieldSchema = fieldSchema.typeError('Ingrese una fecha válida')

          schema[name] = fieldSchema
        }
      })

      return yup.object().shape(schema)
    }

    const { values, errors, setFieldValue, validate, validateField } = useForm({
      validationSchema: generateValidationSchema(),
      initialValues: props.initialData || {},
      validateOnMount: false,
    })

    watch(() => props.initialData, newData => {
      if (newData) {
        Object.entries(newData).forEach(([key, value]) => {
          setFieldValue(key, value)
        })
      }
    })

    const getFieldComponent = (type: FieldType) => {
      switch (type) {
        case 'enum':
          return 'AppSelect'
        case 'text':
          return 'AppTextField'
        case 'date':
        case 'time':
        case 'date-time':
          return 'AppDateTimePicker'
        default:
          return 'AppTextField'
      }
    }

    const getFieldProps = (field: FieldDefinition) => {
      const fieldProps: Record<string, any> = {
        label: field.label,
        placeholder: field.placeholder || `Seleccione ${field.label.toLowerCase()}`,
      }

      if (field.type === 'enum' && field.options?.items)
        fieldProps.items = field.options.items

      if (field.type === 'text' && field.label.toLowerCase().includes('contraseña'))
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

    const onFieldBlur = async (name: string) => {
      if (hasAttemptedSubmit.value)
        await validateField(name)
    }

    const onSubmit = async (e: Event) => {
      e.preventDefault()
      hasAttemptedSubmit.value = true

      const validationResult = await validate()
      if (validationResult.valid)
        emit('submit', values)
    }

    const displayError = (fieldName: string): string | undefined => {
      if (!hasAttemptedSubmit.value)
        return undefined

      return typeof errors.value === 'object' ? errors.value[fieldName] : undefined
    }

    return {
      values,
      displayError,
      visibleFields,
      getFieldComponent,
      getFieldProps,
      onSubmit,
      setFieldValue,
      onFieldBlur,
    }
  },
})
</script>

<template>
  <form
    novalidate
    @submit="onSubmit"
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
          v-bind="getFieldProps(field)"
          :error-messages="displayError(name)"
          @update:model-value="setFieldValue(name, $event)"
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
</style>
