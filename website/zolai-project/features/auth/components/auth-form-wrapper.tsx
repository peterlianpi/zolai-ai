"use client";

import { RegisterForm } from "./register-form";
import { LoginPage } from "./login-page";
import { ForgotPasswordForm } from "./forgot-password-form";
import { ResetPasswordForm } from "./reset-password-form";

// ============================================
// Register Form Wrapper
// ============================================

interface RegisterFormWrapperProps {
  defaultEmail?: string;
  defaultName?: string;
  className?: string;
}

export function RegisterFormWrapper(props: RegisterFormWrapperProps) {
  return <RegisterForm {...props} />;
}

// ============================================
// Login Page Wrapper
// ============================================

interface LoginPageWrapperProps {
  showRegisterLink?: boolean;
  showForgotPasswordLink?: boolean;
  redirectUrl?: string;
  className?: string;
}

export function LoginPageWrapper(props: LoginPageWrapperProps) {
  return <LoginPage {...props} redirectUrl={props.redirectUrl} />;
}

// ============================================
// Forgot Password Form Wrapper
// ============================================

interface ForgotPasswordFormWrapperProps {
  className?: string;
}

export function ForgotPasswordFormWrapper(
  props: ForgotPasswordFormWrapperProps,
) {
  return <ForgotPasswordForm {...props} />;
}

// ============================================
// Reset Password Form Wrapper
// ============================================

interface ResetPasswordFormWrapperProps {
  token?: string;
  className?: string;
}

export function ResetPasswordFormWrapper(props: ResetPasswordFormWrapperProps) {
  return <ResetPasswordForm {...props} />;
}
