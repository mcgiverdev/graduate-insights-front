export { default as EducationCenterFormDialog } from './components/EducationCenterFormDialog.vue'
export { default as EducationCenterTable } from './components/EducationCenterTable.vue'

export { useEducationCenterForm } from './composables/useEducationCenterForm'
export { useEducationCenterList } from './composables/useEducationCenterList'
export { useEducationCenterEditor } from './composables/useEducationCenterEditor'
export { useEducationCenterService } from './composables/useEducationCenterService'

export type {
  EducationCenter,
  EducationCenterApiResponse,
  EducationCenterFilters,
  EducationCenterFormValues,
  EducationCenterPayload,
} from './types'
