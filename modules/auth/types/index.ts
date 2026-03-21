export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export interface RegisterFormValues {
  nombres: string
  apellidos: string
  dni: string
  celular: string
  correo: string
  contrasena: string
}

export interface RedirectTarget {
  path: string
  query?: Record<string, unknown>
}

export interface LoginResult {
  success: boolean
  message: string
  redirectTo?: RedirectTarget
}

export interface VerificationPayload {
  email: string
  code: string
}

export interface VerificationResult {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
}

export interface PasswordChangePayload {
  email: string
  code: string
  newPassword: string
}
