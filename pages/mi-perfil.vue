<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GraduateTabsEditorForm } from '@/src/features/graduates'
import { graduateService } from '~/modules/graduates/services/GraduateService'
import { useSnackbar } from '@/composables/useSnackbar'
import type { Graduate, GraduatePayload } from '~/modules/graduates/types'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

useHead({
  title: 'Mi Perfil Academico - Graduate Insights',
})

const { showSnackbar } = useSnackbar()

const loading = ref(true)
const graduate = ref<Graduate | null>(null)
const loadError = ref(false)

const fetchMyProfile = async (_id: number): Promise<Graduate | null> => {
  return graduateService.fetchMyProfile()
}

const saveMyProfile = async (payload: GraduatePayload, _id: number) => {
  try {
    await graduateService.updateMyProfile(payload)
    showSnackbar({ text: 'Perfil actualizado correctamente', color: 'success' })

    return { success: true }
  }
  catch (error: any) {
    showSnackbar({ text: error?.message ?? 'No se pudo actualizar el perfil', color: 'error' })

    return { success: false, message: error?.message }
  }
}

onMounted(async () => {
  try {
    graduate.value = await graduateService.fetchMyProfile()
  }
  catch (error: any) {
    loadError.value = true
    showSnackbar({ text: 'No se pudo cargar tu perfil academico', color: 'error' })
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <VProgressLinear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-6"
    />

    <VAlert
      v-else-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      No se pudo cargar tu perfil academico. Intenta nuevamente mas tarde.
    </VAlert>

    <GraduateTabsEditorForm
      v-else-if="graduate"
      :graduate-id="graduate.graduateId"
      :fetch-fn="fetchMyProfile"
      :save-fn="saveMyProfile"
      back-route="/"
      page-title="Mi Perfil Academico"
      page-subtitle="Completa y actualiza tu informacion personal, contacto y trayectoria academica."
    />
  </div>
</template>
