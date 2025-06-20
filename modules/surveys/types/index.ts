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
}

// Tipos de encuestas
export enum SurveyType {
  EMPLOYMENT_STATUS = 'EMPLOYMENT_STATUS',
  SATISFACTION = 'SATISFACTION',
  FEEDBACK = 'FEEDBACK',
  EVALUATION = 'EVALUATION',
  CUSTOM = 'CUSTOM',
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
  questions: SurveyQuestion[]
  created_at?: string
  updated_at?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
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
  questions: Omit<SurveyQuestion, 'id'>[]
}

// Interfaz para la respuesta de crear/actualizar encuesta
export interface SurveyResponse {
  success: boolean
  data: Survey
  message?: string
}
