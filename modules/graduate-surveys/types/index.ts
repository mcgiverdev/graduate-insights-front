// Tipos de preguntas basados en la API
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
  EMPLOYMENT_SATISFACTION = 'EMPLOYMENT_SATISFACTION',
  SATISFACTION = 'SATISFACTION',
  FEEDBACK = 'FEEDBACK',
  EVALUATION = 'EVALUATION',
  CUSTOM = 'CUSTOM',
}

// Interfaz para las opciones de respuesta
export interface SurveyOption {
  id: number
  option_text: string
  order_number: number
}

// Interfaz para las preguntas con respuestas
export interface GraduateSurveyQuestion {
  question_id: number
  question_text: string
  question_type: QuestionType
  required: boolean
  answered: boolean
  text_response?: string | null
  number_response?: number | null
  selected_option_ids?: number[]
  options: SurveyOption[]
}

// Interfaz para la encuesta básica en la lista
export interface GraduateSurveyListItem {
  survey_id: number
  title: string
  description: string
  survey_type: SurveyType
  completed: boolean
  created_date: string
  question_count: number
}

// Interfaz para el detalle completo de la encuesta
export interface GraduateSurveyDetail {
  survey_id: number
  survey_title: string
  survey_description: string
  survey_type: SurveyType
  completed: boolean
  submitted_at: string | null
  created_date: string
  questions: GraduateSurveyQuestion[]
}

// Interfaz para la respuesta de la API al listar encuestas
export interface GraduateSurveyListResponse {
  success: boolean
  message: string
  data: GraduateSurveyListItem[]
}

// Interfaz para la respuesta de detalle de encuesta
export interface GraduateSurveyDetailResponse {
  success: boolean
  message: string
  data: GraduateSurveyDetail
}

// Interfaz para una respuesta individual a una pregunta
export interface SurveyQuestionResponse {
  question_id: number
  text_response?: string
  number_response?: number
  selected_option_ids?: number[]
}

// Interfaz para enviar respuestas de encuesta
export interface SurveySubmissionRequest {
  survey_id: number
  responses: SurveyQuestionResponse[]
}

// Interfaz para la respuesta de envío de encuesta
export interface SurveySubmissionResponse {
  success: boolean
  message: string
  data?: any
}

// Estado del formulario para una pregunta
export interface QuestionFormState {
  questionId: number
  textResponse: string
  numberResponse: number | null
  selectedOptionIds: number[]
  isValid: boolean
}

// Estado completo del formulario de encuesta
export interface SurveyFormState {
  surveyId: number
  questions: Map<number, QuestionFormState>
  isValid: boolean
  isSubmitting: boolean
}
