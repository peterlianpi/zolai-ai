// ============================================
// Authentication Types
// ============================================

// Core credential types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

// Password reset types
export interface ForgotPasswordEmail {
  email: string;
}

export interface ResetPasswordToken {
  token: string;
  password: string;
}

// Email verification types
export interface VerificationEmail {
  email: string;
}

export interface VerifyEmailToken {
  token: string;
}

// Callback types for component events
export interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onVerificationRequired?: () => void;
}

// Base props with className
export interface BaseProps {
  className?: string;
}

// Login page props
export interface LoginPageProps {
  showRegisterLink?: boolean;
  showForgotPasswordLink?: boolean;
  redirectUrl?: string;
  className?: string;
}

// Register form props
export interface RegisterFormProps {
  defaultEmail?: string;
  defaultName?: string;
  showLoginLink?: boolean;
  className?: string;
}

// Forgot password form props
export type ForgotPasswordFormProps = {
  className?: string;
};

// Reset password form props
export type ResetPasswordFormProps = {
  token?: string;
  className?: string;
};

// Resend verification form props
// Resend verification form props
export interface ResendVerificationFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

// Verify email page props
// Verify email page props
export interface VerifyEmailPageProps {
  callbackUrl?: string;
  onGoToDashboard?: () => void;
  className?: string;
}

// Password input props
export interface PasswordInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  showStrength?: boolean;
  showConfirm?: boolean;
  confirmPassword?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

// Password strength indicator props
export interface PasswordStrengthIndicatorProps {
  password: string;
  name?: string;
  email?: string;
  oldPassword?: string;
  className?: string;
}

// Auth state types
export interface AuthState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// API response types
export interface AuthApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form validation errors
export interface ValidationError {
  field: string;
  message: string;
}
