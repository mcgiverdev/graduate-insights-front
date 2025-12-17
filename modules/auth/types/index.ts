export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
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
}
