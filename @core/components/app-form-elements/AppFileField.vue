<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { $api } from '@/utils/api'

interface Props {
  modelValue?: string | null
  label?: string
  placeholder?: string
  accept?: string
  maxSize?: number
  errorMessages?: string | string[]
  error?: boolean
  disabled?: boolean
  required?: boolean
  graduateId?: number
  fileType?: string
}

interface Emits {
  (event: 'update:modelValue', value: string | null): void
  (event: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: 'Seleccionar archivo',
  accept: '',
  maxSize: 10240,
  errorMessages: '',
  error: false,
  disabled: false,
  required: false,
  fileType: 'CV',
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const currentFileName = ref<string | null>(null)

// Inicializar el nombre del archivo cuando se monta el componente
onMounted(() => {
  if (props.modelValue)
    currentFileName.value = props.modelValue
})

// Observar cambios en el modelValue
watch(() => props.modelValue, newValue => {
  currentFileName.value = newValue
})

const selectedFile = computed(() => currentFileName.value)
const hasFile = computed(() => Boolean(currentFileName.value))

const fileSize = computed(() => {
  if (!selectedFile.value)
    return ''
  const size = selectedFile.value.size
  if (size < 1024)
    return `${size} B`
  if (size < 1048576)
    return `${(size / 1024).toFixed(1)} KB`

  return `${(size / 1048576).toFixed(1)} MB`
})

const isValidFile = (file: File): boolean => {
  // Verificar tamaño
  if (props.maxSize && file.size > props.maxSize * 1024)
    return false

  // Verificar tipo de archivo si se especifica accept
  if (props.accept && props.accept.trim() !== '') {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.'))
        return file.name.toLowerCase().endsWith(type.toLowerCase())

      return file.type.match(type.replace('*', '.*'))
    })

    if (!isAccepted)
      return false
  }

  return true
}

const uploadFile = async (file: File) => {
  try {
    isLoading.value = true

    const formData = new FormData()

    formData.append('file', file)
    formData.append('fileType', props.fileType)
    if (props.graduateId)
      formData.append('graduateId', props.graduateId.toString())

    const response = await $api('/graduate-insights/v1/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }
  catch (error: any) {
    console.error('Error al subir el archivo:', error)
    emit('error', error.message || 'Error al subir el archivo')
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const handleFileSelect = async (event: Event) => {
  event.stopPropagation()

  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  if (file && !isValidFile(file)) {
    if (fileInput.value)
      fileInput.value.value = ''

    return
  }

  if (file) {
    try {
      const result = await uploadFile(file)

      currentFileName.value = result
      emit('update:modelValue', result)
    }
    catch (error) {
      if (fileInput.value)
        fileInput.value.value = ''
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0] || null

  if (file && !isValidFile(file))
    return

  if (file) {
    try {
      const result = await uploadFile(file)

      currentFileName.value = result
      emit('update:modelValue', result)

      if (fileInput.value) {
        const dataTransfer = new DataTransfer()

        dataTransfer.items.add(file)
        fileInput.value.files = dataTransfer.files
      }
    }
    catch (error) {
      // Error ya manejado en uploadFile
    }
  }
}

const removeFile = async (event: Event) => {
  event.stopPropagation()

  const confirmed = await window.confirm('¿Estás seguro de que deseas eliminar este archivo?')
  if (!confirmed)
    return

  // Eliminado lógico: solo actualizamos el estado y emitimos null
  currentFileName.value = null
  emit('update:modelValue', null)
  if (fileInput.value)
    fileInput.value.value = ''
}

const openFileDialog = () => {
  if (!props.disabled)
    fileInput.value?.click()
}

const formatMaxSize = computed(() => {
  if (!props.maxSize)
    return ''
  if (props.maxSize < 1024)
    return `${props.maxSize} KB`

  return `${(props.maxSize / 1024).toFixed(1)} MB`
})
</script>

<template>
  <div class="app-file-field">
    <VLabel
      v-if="label"
      class="mb-2"
      :class="{ 'text-error': error }"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-error"
      >*</span>
    </VLabel>

    <div
      class="file-drop-zone"
      :class="{
        'file-drop-zone--dragging': isDragging,
        'file-drop-zone--error': error,
        'file-drop-zone--disabled': disabled || isLoading,
        'file-drop-zone--has-file': hasFile,
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :disabled="disabled || isLoading"
        class="file-input"
        @click.stop
        @change="handleFileSelect"
      >

      <!-- Contenido cuando no hay archivo -->
      <div
        v-if="!hasFile"
        class="file-drop-content"
      >
        <VIcon
          icon="tabler-upload"
          size="48"
          class="mb-3"
          :class="{ 'text-disabled': disabled || isLoading }"
        />
        <p class="text-body-1 mb-2">
          {{ placeholder }}
        </p>
        <p class="text-body-2 text-disabled">
          Arrastra y suelta un archivo aquí o haz clic para seleccionar
        </p>
        <p
          v-if="formatMaxSize"
          class="text-caption text-disabled mt-1"
        >
          Tamaño máximo: {{ formatMaxSize }}
        </p>
      </div>

      <!-- Contenido cuando hay archivo seleccionado -->
      <div
        v-else
        class="file-selected-content d-flex align-center w-100"
      >
        <VIcon
          icon="tabler-file"
          size="24"
          class="mr-2"
        />
        <span class="text-body-1 text-truncate">{{ selectedFile }}</span>
        <VBtn
          icon
          variant="text"
          size="small"
          color="error"
          class="ml-auto"
          :disabled="isLoading"
          :loading="isLoading"
          @click.stop="removeFile"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </div>
    </div>

    <!-- Mensajes de error -->
    <div
      v-if="errorMessages"
      class="text-error text-caption mt-1"
    >
      {{ Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-file-field {
  .file-drop-zone {
    position: relative;
    padding: 1rem;
    border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgb(var(--v-theme-primary));
    }

    &--dragging {
      border-color: rgb(var(--v-theme-primary));
      background-color: rgba(var(--v-theme-primary), 0.05);
    }

    &--error {
      border-color: rgb(var(--v-theme-error));
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        border-color: rgba(var(--v-border-color), var(--v-border-opacity));
      }
    }
  }

  .file-input {
    position: absolute;
    block-size: 0;
    inline-size: 0;
    opacity: 0;
  }

  .file-selected-content {
    padding: 0.5rem;
  }
}
</style>
