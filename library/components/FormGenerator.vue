<script lang="ts">
import { useForm } from 'vee-validate'
import type { PropType } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import * as yup from 'yup'
import type { FieldDefinition, ModelDefinition } from '../types/ModelDefinition'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'

export default defineComponent({
  name: 'FormGenerator',
  components: {
    AppTextField,
    AppSelect,
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
          let fieldSchema = yup.mixed()

          config.rules.forEach(rule => {
            if (rule === 'required') {
              fieldSchema = yup.string().required('Este campo es requerido')
            }
            else if (rule === 'email') {
              fieldSchema = (fieldSchema as any).email('Ingrese un correo electrónico válido')
            }
            else if (rule === 'numeric') {
              fieldSchema = yup.number().typeError('Este campo debe ser numérico')
            }
            else if (rule === 'date') {
              fieldSchema = yup.date().typeError('Ingrese una fecha válida')
            }
            else if (rule.startsWith('min:')) {
              const minLength = Number.parseInt(rule.split(':')[1])

              fieldSchema = (fieldSchema as any).min(minLength, `Mínimo ${minLength} caracteres`)
            }
          })

          schema[name] = fieldSchema
        }
      })

      return yup.object().shape(schema)
    }

    const { handleSubmit, values, errors, setFieldValue, validate, validateField } = useForm({
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

    const getFieldComponent = (type: string) => {
      switch (type) {
        case 'enum':
          return 'AppSelect'
        case 'text':
        case 'date':
          return 'AppTextField'
        default:
          return 'AppTextField'
      }
    }

    const getFieldProps = (field: FieldDefinition) => {
      const fieldProps: Record<string, any> = {
        label: field.label,
        placeholder: field.placeholder,
      }

      if (field.type === 'enum' && field.options?.items)
        fieldProps.items = field.options.items

      if (field.type === 'text' && field.label.toLowerCase().includes('contraseña'))
        fieldProps.type = 'password'

      if (field.type === 'date')
        fieldProps.type = 'date'

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
