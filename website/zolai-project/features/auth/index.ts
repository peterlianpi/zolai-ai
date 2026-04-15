// ============================================
// Authentication Feature Module
// ============================================
// Self-contained authentication components, hooks, and types
// for use across the application.
//
// @module features/auth
// @version 2.0.0
// @see README.md for usage examples
// @see API.md for detailed API reference

// ============================================
// Types
// ============================================

/** User login credentials. */
export type { LoginCredentials } from "./types/auth";

/** User registration data. */
export type { RegisterData } from "./types/auth";

/** Password reset request data. */
export type { ResetPasswordData } from "./types/auth";

/** Forgot password email input. */
export type { ForgotPasswordEmail } from "./types/auth";

/** Reset password token data. */
export type { ResetPasswordToken } from "./types/auth";

/** Verification email input. */
export type { VerificationEmail } from "./types/auth";

/** Email verification token data. */
export type { VerifyEmailToken } from "./types/auth";

/** Authentication callback functions. */
export type { AuthCallbacks } from "./types/auth";

/** Login page component props. */
export type { LoginPageProps } from "./types/auth";

/** Register form component props. */
export type { RegisterFormProps } from "./types/auth";

/** Forgot password form props. */
export type { ForgotPasswordFormProps } from "./types/auth";

/** Reset password form props. */
export type { ResetPasswordFormProps } from "./types/auth";

/** Resend verification form props. */
export type { ResendVerificationFormProps } from "./types/auth";

/** Verify email page props. */
export type { VerifyEmailPageProps } from "./types/auth";

/** Password input component props. */
export type { PasswordInputProps } from "./types/auth";

/** Password strength indicator props. */
export type { PasswordStrengthIndicatorProps } from "./types/auth";

/** Authentication state. */
export type { AuthState } from "./types/auth";

/** Generic API response type. */
export type { AuthApiResponse } from "./types/auth";

/** Form validation error. */
export type { ValidationError } from "./types/auth";

// ============================================
// Component Exports
// ============================================

/**
 * Complete login page component with form, validation, and navigation links.
 * Includes email and password fields, remember me checkbox, and links to register/forgot password.
 *
 * @example
 * ```tsx
 * import { LoginPage } from "@/features/auth";
 *
 * <LoginPage
 *   onSuccess={() => router.push("/dashboard")}
 *   onError={(error) => toast.error(error)}
 *   showRegisterLink={true}
 *   showForgotPasswordLink={true}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/login-page.tsx | Source}
 */
export { LoginPage } from "./components/login-page";

/**
 * Registration form component with name, email, password fields and validation.
 * Includes password strength indicator and confirmation field.
 *
 * @example
 * ```tsx
 * import { RegisterForm } from "@/features/auth";
 *
 * <RegisterForm
 *   defaultEmail="user@example.com"
 *   onVerificationRequired={() => router.push("/verification-pending")}
 *   showLoginLink={true}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/register-form.tsx | Source}
 */
export { RegisterForm } from "./components/register-form";

/**
 * Password recovery form component.
 * Sends a password reset email to the user.
 *
 * @example
 * ```tsx
 * import { ForgotPasswordForm } from "@/features/auth";
 *
 * <ForgotPasswordForm
 *   onSuccess={() => setShowSuccess(true)}
 *   onLoginClick={() => router.push("/login")}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/forgot-password-form.tsx | Source}
 */
export { ForgotPasswordForm } from "./components/forgot-password-form";

/**
 * Password reset form component with token support.
 * Validates the reset token and allows setting a new password.
 *
 * @example
 * ```tsx
 * import { ResetPasswordForm } from "@/features/auth";
 *
 * <ResetPasswordForm
 *   token={resetToken}
 *   onSuccess={() => router.push("/login")}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/reset-password-form.tsx | Source}
 */
export { ResetPasswordForm } from "./components/reset-password-form";

/**
 * Resend verification email form component.
 * Allows users to request a new verification email.
 *
 * @example
 * ```tsx
 * import { ResendVerificationForm } from "@/features/auth";
 *
 * <ResendVerificationForm
 *   onSuccess={() => toast.success("Verification email sent!")}
 *   onBackToLogin={() => router.push("/login")}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/resend-verification-form.tsx | Source}
 */
export { ResendVerificationForm } from "./components/resend-verification-form";

/**
 * Email verification success page.
 * Displays after successful email verification.
 *
 * @example
 * ```tsx
 * import { VerifyEmailPage, VerifyEmailPageWrapper } from "@/features/auth";
 *
 * <VerifyEmailPageWrapper
 *   callbackUrl="/dashboard"
 *   onGoToDashboard={() => router.push("/dashboard")}
 * />
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./components/verify-email-page.tsx | Source}
 */
export {
  VerifyEmailPage,
  VerifyEmailPageWrapper,
} from "./components/verify-email-page";

// ============================================
// Legacy Components (Backward Compatibility)
// ============================================

/**
 * Legacy login form component.
 * @deprecated Use {@link LoginPage} instead for complete login page functionality.
 */
export { LoginForm } from "./components/login-form";

/**
 * Legacy signup form component.
 * @deprecated Use {@link RegisterForm} instead.
 */
export { SignupForm } from "./components/signup-form";

/**
 * Password input with visibility toggle.
 *
 * @example
 * ```tsx
 * import { PasswordInput } from "@/features/auth";
 *
 * <PasswordInput
 *   name="password"
 *   label="Password"
 *   showStrength={true}
 *   showConfirm={true}
 * />
 * ```
 */
export { PasswordInput } from "./components/password-input";

/**
 * Password strength visualization component.
 * Shows password strength meter with feedback.
 *
 * @example
 * ```tsx
 * import { PasswordStrengthIndicator } from "@/features/auth";
 *
 * <PasswordStrengthIndicator
 *   password={password}
 *   email={email}
 * />
 * ```
 */
export { PasswordStrengthIndicator } from "./components/password-strength-indicator";

// ============================================
// Hook Exports
// ============================================

/**
 * Authentication hook for user login.
 * Provides login function, loading state, and error handling.
 *
 * @example
 * ```tsx
 * import { useLogin } from "@/features/auth";
 *
 * function LoginForm() {
 *   const { login, isLoading, error, clearError } = useLogin();
 *
 *   const handleSubmit = async () => {
 *     clearError();
 *     const success = await login({ email, password });
 *     if (success) router.push("/dashboard");
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>Login</button>;
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./hooks/use-auth-mutation.ts | Source}
 */
export { useLogin } from "./hooks/use-auth-mutation";

/**
 * Authentication hook for user registration.
 * Provides register function, loading state, and error handling.
 *
 * @example
 * ```tsx
 * import { useRegister } from "@/features/auth";
 *
 * function RegisterForm() {
 *   const { register, isLoading, error, clearError } = useRegister();
 *
 *   const handleSubmit = async () => {
 *     clearError();
 *     const success = await register({ name, email, password, confirmPassword });
 *     if (success) router.push("/verification-pending");
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>Register</button>;
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./hooks/use-auth-mutation.ts | Source}
 */
export { useRegister } from "./hooks/use-auth-mutation";

/**
 * Hook for initiating password reset.
 * Sends a password reset email to the user.
 *
 * @example
 * ```tsx
 * import { useForgotPassword } from "@/features/auth";
 *
 * function ForgotPasswordForm() {
 *   const { sendResetEmail, isLoading, error, clearError } = useForgotPassword();
 *
 *   const handleSubmit = async () => {
 *     clearError();
 *     const success = await sendResetEmail(email);
 *     if (success) setShowSuccess(true);
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>Send Reset Link</button>;
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./hooks/use-forgot-password.ts | Source}
 */
export { useForgotPassword } from "./hooks/use-forgot-password";

/**
 * Hook for completing password reset with token.
 *
 * @example
 * ```tsx
 * import { useResetPassword } from "@/features/auth";
 *
 * function ResetPasswordForm({ token }) {
 *   const { reset, isLoading, error, clearError } = useResetPassword();
 *
 *   const handleSubmit = async () => {
 *     clearError();
 *     const success = await reset(token, newPassword);
 *     if (success) router.push("/login");
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>Reset Password</button>;
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./hooks/use-reset-password.ts | Source}
 */
export { useResetPassword } from "./hooks/use-reset-password";

/**
 * Hook for resending email verification.
 *
 * @example
 * ```tsx
 * import { useResendVerification } from "@/features/auth";
 *
 * function ResendVerificationForm() {
 *   const { resend, isLoading, error, clearError } = useResendVerification();
 *
 *   const handleSubmit = async () => {
 *     clearError();
 *     const success = await resend(email);
 *     if (success) setShowSuccess(true);
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>Resend Verification</button>;
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./hooks/use-resend-verification.ts | Source}
 */
export { useResendVerification } from "./hooks/use-resend-verification";

// ============================================
// API Exports
// ============================================

/**
 * Authenticate a user with email and password.
 *
 * @param credentials - User login credentials
 * @returns API response with user and session data
 *
 * @example
 * ```typescript
 * import { login } from "@/features/auth";
 *
 * const result = await login({
 *   email: "user@example.com",
 *   password: "password123",
 *   rememberMe: true,
 * });
 *
 * if (result.success) {
 *   console.log("Logged in:", result.data?.user);
 * }
 * ```
 *
 * @see {@link README.md | README}
 * @see {@link ./lib/auth-api.ts | Source}
 */
export { login } from "./lib/auth-api";

/**
 * Create a new user account.
 *
 * @param data - User registration data
 * @returns API response with user and session data
 *
 * @example
 * ```typescript
 * import { register } from "@/features/auth";
 *
 * const result = await register({
 *   name: "John Doe",
 *   email: "user@example.com",
 *   password: "SecureP@ss123",
 *   confirmPassword: "SecureP@ss123",
 * });
 * ```
 */
export { register } from "./lib/auth-api";

/**
 * Initiate password reset by sending a reset email.
 *
 * @param email - User's email address
 * @returns API response
 *
 * @example
 * ```typescript
 * import { forgotPassword } from "@/features/auth";
 *
 * const result = await forgotPassword("user@example.com");
 * ```
 */
export { forgotPassword } from "./lib/auth-api";

/**
 * Reset a user's password using a reset token.
 *
 * @param token - Reset token from email
 * @param newPassword - New password
 * @returns API response
 *
 * @example
 * ```typescript
 * import { resetPassword } from "@/features/auth";
 *
 * const result = await resetPassword(token, "NewPassword123");
 * ```
 */
export { resetPassword } from "./lib/auth-api";

/**
 * Verify a user's email address.
 *
 * @param token - Verification token from email
 * @returns API response with verification status
 *
 * @example
 * ```typescript
 * import { verifyEmail } from "@/features/auth";
 *
 * const result = await verifyEmail(token);
 * ```
 */
export { verifyEmail } from "./lib/auth-api";

/**
 * Resend the verification email.
 *
 * @param email - User's email address
 * @returns API response
 *
 * @example
 * ```typescript
 * import { resendVerificationEmail } from "@/features/auth";
 *
 * const result = await resendVerificationEmail("user@example.com");
 * ```
 */
export { resendVerificationEmail } from "./lib/auth-api";

/**
 * Sign out the current user.
 *
 * @returns API response
 *
 * @example
 * ```typescript
 * import { signOut } from "@/features/auth";
 *
 * const result = await signOut();
 * ```
 */
export { signOut } from "./lib/auth-api";

/**
 * Sign in with a social provider.
 *
 * @param provider - Social provider (google, github, or discord)
 *
 * @example
 * ```typescript
 * import { signInWithSocial } from "@/features/auth";
 *
 * await signInWithSocial("google");
 * ```
 */
export { signInWithSocial } from "./lib/auth-api";

/**
 * Send a welcome email to a newly registered user.
 *
 * @param name - User's name
 * @param email - User's email address
 * @returns API response with message ID
 *
 * @example
 * ```typescript
 * import { sendWelcomeEmail } from "@/features/auth";
 *
 * const result = await sendWelcomeEmail("John Doe", "john@example.com");
 * ```
 */
export { sendWelcomeEmail } from "./lib/auth-api";
