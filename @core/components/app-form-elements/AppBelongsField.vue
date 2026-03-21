<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useApi } from '@/composables/useApi'

interface BelongsOption {
  key: string | number
  value: string
}

interface Props {
  modelValue?: string | number | null
  label?: string
  placeholder?: string
  apiEndpoint?: string
  displayField?: string
  valueField?: string
  error?: boolean
  errorMessages?: string | string[]
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: 'Seleccione una opción',
  apiEndpoint: '',
  displayField: 'value',
  valueField: 'key',
  error: false,
  errorMessages: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const loading = ref(false)
const options = ref<BelongsOption[]>([])
const internalValue = ref(props.modelValue)

const mappedOptions = computed(() => {
  return options.value.map(option => ({
    title: option[props.displayField as keyof BelongsOption] as string,
    value: option[props.valueField as keyof BelongsOption],
  }))
})

const loadOptions = async () => {
  if (!props.apiEndpoint) {
    console.warn('AppBelongsField: No apiEndpoint provided')

    return
  }

  loading.value = true
  try {
    const response = await useApi(props.apiEndpoint)

    if (Array.isArray(response.data))
      options.value = response.data
    else
      console.warn('AppBelongsField: API response is not an array:', response.data)
  }
  catch (error) {
    console.error('Error loading options:', error)
  }
  finally {
    loading.value = false
  }
}

const updateValue = (value: string | number | null) => {
  internalValue.value = value
  emit('update:modelValue', value)
}

// Watch for changes in apiEndpoint
watch(() => props.apiEndpoint, newEndpoint => {
  if (newEndpoint)
    loadOptions()
}, { immediate: true })

// Watch for changes in modelValue from parent
watch(() => props.modelValue, newValue => {
  internalValue.value = newValue
})

onMounted(() => {
  if (props.apiEndpoint)
    loadOptions()
})
</script>

<template>
  <AppSelect
    :model-value="internalValue"
    :label="label"
    :placeholder="placeholder"
    :items="mappedOptions"
    :loading="loading"
    :error="error"
    :error-messages="errorMessages"
    :disabled="disabled"
    :required="required"
    @update:model-value="updateValue"
  />
</template>
