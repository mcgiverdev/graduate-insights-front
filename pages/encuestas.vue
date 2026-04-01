<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES } from '@/composables/useRoles'
import { useSnackbar } from '@/composables/useSnackbar'
import { SurveyBuilder, SurveyList, SurveyPreview, useSurveysPage } from '@/src/features/surveys'
import { useLayoutConfigStore } from '@layouts/stores/config'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

// Composables
const { snackbar } = useSnackbar()
const {
  currentView,
  editingSurvey,
  previewSurvey,
  showCreateForm,
  showEditForm,
  backToList,
  handleSurveySaved,
  handleViewSurvey,
  closePreview,
  handleDuplicateSurvey,
} = useSurveysPage()

const isPreviewOpen = computed({
  get: () => previewSurvey.value !== null,
  set: (val) => { if (!val) closePreview() },
})

// Forzar ancho completo (fluid) al entrar en modo editor y restaurar al salir.
// Se usa useLayoutConfigStore directamente porque es la fuente que lee el layout.
const layoutConfig = useLayoutConfigStore()
let previousContentWidth = layoutConfig.appContentWidth

watch(currentView, (view) => {
  if (view !== 'list') {
    previousContentWidth = layoutConfig.appContentWidth
    layoutConfig.appContentWidth = 'fluid'
  }
  else {
    layoutConfig.appContentWidth = previousContentWidth
  }
}, { immediate: true })

// Restaurar si el usuario navega fuera de la página sin volver al listado
onUnmounted(() => {
  layoutConfig.appContentWidth = previousContentWidth
})
</script>

<template>
  <RoleGuard
    :roles="[ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR]"
    fallback
  >
    <div class="surveys-page">
      <!-- Vista de listado -->
      <SurveyList
        v-if="currentView === 'list'"
        @create-survey="showCreateForm"
        @view-survey="handleViewSurvey"
        @edit-survey="showEditForm"
        @duplicate-survey="handleDuplicateSurvey"
      />

      <!-- Vista de creación/edición -->
      <SurveyBuilder
        v-else
        :editing-survey="editingSurvey"
        @save="handleSurveySaved"
        @cancel="backToList"
      />
    </div>

    <template #fallback>
      <VCard>
        <VCardText class="text-center py-8">
          <VIcon
            size="64"
            color="warning"
            icon="tabler-user-x"
          />
          <h3 class="text-h5 mt-4 mb-2">
            Acceso Restringido
          </h3>
          <p class="text-body-1 mb-4">
            Esta sección es para la gestión de encuestas por parte de empleadores, directores y administradores.
          </p>
          <p class="text-body-2 text-medium-emphasis">
            Si eres graduado, puedes acceder a "Mis Encuestas" para responder las encuestas asignadas.
          </p>
        </VCardText>
      </VCard>
    </template>
  </RoleGuard>

  <!-- Diálogo de previsualización de encuesta -->
  <VDialog
    v-model="isPreviewOpen"
    max-width="760"
    scrollable
  >
    <VCard v-if="previewSurvey">
      <VCardTitle class="d-flex align-center justify-space-between pa-4 pb-2">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-eye" color="primary" />
          <span>Vista Previa — {{ previewSurvey.title }}</span>
        </div>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="closePreview"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <SurveyPreview
          :survey="previewSurvey"
          :title="previewSurvey.title"
          :description="previewSurvey.description"
        />
      </VCardText>
      <VDivider />
      <VCardActions class="justify-end pa-3">
        <VBtn
          variant="tonal"
          color="primary"
          prepend-icon="tabler-edit"
          @click="() => { closePreview(); showEditForm(previewSurvey!) }"
        >
          Editar encuesta
        </VBtn>
        <VBtn
          variant="outlined"
          @click="closePreview"
        >
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Notificaciones -->
  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.text }}
  </VSnackbar>
</template>

<style scoped>
.surveys-page {
  padding: 24px;
}
</style>
