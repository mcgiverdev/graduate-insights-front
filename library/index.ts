// Core exports
export { Resource } from './core/Resource'

// Field exports
export { Fields } from './fields'
export type { FormField } from './fields/FormField'

// Resource exports
export { DirectorResource } from './resources/DirectorResource'
export { EducationCenterResource } from './resources/education-centers/EducationCenterResource'
export { EmployerResource } from './resources/employers/EmployerResource'
export { GraduateResource } from './resources/graduates/GraduateResource'
export { JobResource } from './resources/jobs/JobResource'

// Component exports
export { default as FormGenerator } from './components/FormGenerator.vue'
export { default as ResourceManager } from './components/ResourceManager.vue'
export { default as TableGenerator } from './components/TableGenerator.vue'
