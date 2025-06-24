// Tipos de preguntas disponibles
export enum QuestionType {
  YES_NO = 'YES_NO',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SCALE = 'SCALE',
}

// Tipos de encuestas
export enum SurveyType {
  EMPLOYMENT = 'EMPLOYMENT',
  ACADEMIC = 'ACADEMIC',
}

// Estados de encuestas
export enum SurveyStatus {
  DRAFT = 'DRAFT', // Borrador - En construcción
  ACTIVE = 'ACTIVE', // Activa - Disponible para responder
  PAUSED = 'PAUSED', // Pausada - Temporalmente no disponible
  CLOSED = 'CLOSED', // Cerrada - Ya no acepta respuestas
  COMPLETED = 'COMPLETED', // Completada - Finalizada y procesada
}

// Interfaz para las opciones de respuesta
export interface SurveyOption {
  id?: number
  option_text: string
  order_number: number
}

// Interfaz para las preguntas
export interface SurveyQuestion {
  id?: number
  question_text: string
  question_type: QuestionType
  required: boolean
  options: SurveyOption[]
  order_number?: number
}

// Interfaz para la encuesta completa
export interface Survey {
  id?: number
  title: string
  description: string
  survey_type: SurveyType
  status: SurveyStatus
  start_date: string
  end_date?: string
  questions: SurveyQuestion[]
  created_at?: string
  updated_at?: string
}

// Interfaz para la respuesta de la API al listar encuestas
export interface SurveyListResponse {
  success: boolean
  data: Survey[]
  paginate: {
    totalElements: number
    totalPages: number
    currentPage: number
  }
}

// Interfaz para crear/actualizar encuestas
export interface CreateSurveyRequest {
  title: string
  description: string
  survey_type: SurveyType
  status: SurveyStatus
  start_date: string
  end_date?: string
  questions: Omit<SurveyQuestion, 'id'>[]
}

// Interfaz para la respuesta de crear/actualizar encuesta
export interface SurveyResponse {
  success: boolean
  data: Survey
  message?: string
}
