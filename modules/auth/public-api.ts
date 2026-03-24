export { default as LoginForm } from './components/LoginForm.vue'
export { default as VerificationForm } from './components/VerificationForm.vue'

export { useLoginForm } from './composables/useLoginForm'
export { useForgotPasswordForm } from './composables/useForgotPasswordForm'
export { useRegisterForm } from './composables/useRegisterForm'
export { useResetPasswordForm } from './composables/useResetPasswordForm'
export { useVerificationForm } from './composables/useVerificationForm'
export { authModuleService } from './services/AuthService'

export type {
  LoginFormValues,
  LoginResult,
  PasswordChangePayload,
  RedirectTarget,
  RegisterFormValues,
  VerificationPayload,
  VerificationResult,
} from './types'
