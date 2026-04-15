# Authentication API Reference

Complete API reference for the authentication feature module. This document provides detailed information about all exported functions, hooks, types, and components.

## Table of Contents

- [API Functions](#api-functions)
- [React Hooks](#react-hooks)
- [Components](#components)
- [Types](#types)
- [Constants](#constants)

---

## API Functions

All API functions are located in `lib/auth-api.ts` and exported from `index.ts`.

### login

Authenticate a user with email and password credentials.

**Signature:**

```typescript
export async function login(
  credentials: LoginCredentials
): Promise<AuthApiResponse<{ user?: unknown; session?: unknown }>>
```

**Parameters:**

| Parameter     | Type               | Required | Description                          |
| ------------- | ------------------ | -------- | ------------------------------------ |
| `credentials` | `LoginCredentials` | Yes      | Object containing email and password |

**LoginCredentials:**

```typescript
interface LoginCredentials {
  email: string;        // User's email address
  password: string;     // User's password
  rememberMe?: boolean; // Optional remember me flag
}
```

**Returns:**

- `success: true, data: { user, session }` on successful login
- `success: false, error: string` on failure

**Example:**

```typescript
import { login } from "@/features/auth";

const result = await login({
  email: "user@example.com",
  password: "securePassword123",
  rememberMe: true,
});

if (result.success) {
  console.log("Logged in user:", result.data?.user);
} else {
  console.error("Login failed:", result.error);
}
```

**Error Handling:**

- Returns specific error for unverified email: "Please verify your email address before logging in."
- Returns generic error for invalid credentials
- Catches and handles unexpected errors

---

### register

Create a new user account with email and password.

**Signature:**

```typescript
export async function register(
  data: RegisterData
): Promise<AuthApiResponse<{ user?: unknown; session?: unknown }>>
```

**Parameters:**

| Parameter | Type           | Required | Description                         |
| --------- | -------------- | -------- | ----------------------------------- |
| `data`    | `RegisterData` | Yes      | Object containing registration data |

**RegisterData:**

```typescript
interface RegisterData {
  name: string;         // User's full name
  email: string;        // User's email address
  password: string;      // User's password
  confirmPassword: string; // Password confirmation
}
```

**Returns:**

- `success: true, data: { user, session }` on successful registration
- `success: false, error: string` on failure

**Example:**

```typescript
import { register } from "@/features/auth";

const result = await register({
  name: "John Doe",
  email: "user@example.com",
  password: "SecureP@ss123",
  confirmPassword: "SecureP@ss123",
});

if (result.success) {
  console.log("Account created for:", result.data?.user);
} else {
  console.error("Registration failed:", result.error);
}
```

---

### forgotPassword

Initiate password reset by sending a reset email to the user.

**Signature:**

```typescript
export async function forgotPassword(
  email: string
): Promise<AuthApiResponse>
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `email`   | `string` | Yes      | User's email address |

**Returns:**

- `success: true` on email sent successfully
- `success: false, error: string` on failure

**Example:**

```typescript
import { forgotPassword } from "@/features/auth";

const result = await forgotPassword("user@example.com");

if (result.success) {
  console.log("Password reset email sent");
} else {
  console.error("Failed to send reset email:", result.error);
}
```

**Redirect Configuration:**

The reset email includes a link to `/reset-password` with the reset token.

---

### resetPassword

Reset a user's password using a valid reset token.

**Signature:**

```typescript
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthApiResponse>
```

**Parameters:**

| Parameter     | Type     | Required | Description                    |
| ------------- | -------- | -------- | ------------------------------ |
| `token`       | `string` | Yes      | Reset token received via email |
| `newPassword` | `string` | Yes      | New password to set            |

**Returns:**

- `success: true` on successful password reset
- `success: false, error: string` on failure

**Example:**

```typescript
import { resetPassword } from "@/features/auth";

// Token from URL query parameter or email link
const token = "abc123-reset-token";

const result = await resetPassword(token, "NewSecureP@ss123");

if (result.success) {
  console.log("Password reset successfully");
  // Redirect to login page
} else {
  console.error("Password reset failed:", result.error);
}
```

---

### verifyEmail

Verify a user's email address using a verification token.

**Signature:**

```typescript
export async function verifyEmail(
  token: string
): Promise<AuthApiResponse<{ status: boolean }>>
```

**Parameters:**

| Parameter | Type     | Required | Description                   |
| --------- | -------- | -------- | ----------------------------- |
| `token`   | `string` | Yes      | Verification token from email |

**Returns:**

- `success: true, data: { status: true }` on successful verification
- `success: false, error: string` on failure

**Example:**

```typescript
import { verifyEmail } from "@/features/auth";

const token = "abc123-verify-token";

const result = await verifyEmail(token);

if (result.success) {
  console.log("Email verified:", result.data?.status);
} else {
  console.error("Verification failed:", result.error);
}
```

---

### resendVerificationEmail

Resend the verification email to a user.

**Signature:**

```typescript
export async function resendVerificationEmail(
  email: string
): Promise<AuthApiResponse>
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `email`   | `string` | Yes      | User's email address |

**Returns:**

- `success: true` on email sent successfully
- `success: false, error: string` on failure

**Example:**

```typescript
import { resendVerificationEmail } from "@/features/auth";

const result = await resendVerificationEmail("user@example.com");

if (result.success) {
  console.log("Verification email resent");
} else {
  console.error("Failed to resend:", result.error);
}
```

---

### signOut

Sign out the currently authenticated user.

**Signature:**

```typescript
export async function signOut(): Promise<AuthApiResponse>
```

**Returns:**

- `success: true` on successful sign out
- `success: false, error: string` on failure

**Example:**

```typescript
import { signOut } from "@/features/auth";

const result = await signOut();

if (result.success) {
  console.log("Signed out successfully");
  // Redirect to home or login page
} else {
  console.error("Sign out failed:", result.error);
}
```

---

### signInWithSocial

Initiate social authentication with a supported provider.

**Signature:**

```typescript
export async function signInWithSocial(
  provider: "google" | "github" | "discord"
): Promise<void>
```

**Parameters:**

| Parameter  | Type                                | Required | Description            |
| ---------- | ----------------------------------- | -------- | ---------------------- |
| `provider` | `'google' \| 'github' \| 'discord'` | Yes      | Social provider to use |

**Returns:**

- `Promise<void>` - The function redirects to the OAuth flow

**Example:**

```typescript
import { signInWithSocial } from "@/features/auth";

// Google OAuth
await signInWithSocial("google");

// GitHub OAuth
await signInWithSocial("github");

// Discord OAuth
await signInWithSocial("discord");
```

**Note:** This function redirects the browser to the OAuth provider's authentication page. The user will be redirected back after authentication.

---

### sendWelcomeEmail

Send a welcome email to a newly registered user.

**Signature:**

```typescript
export async function sendWelcomeEmail(
  name: string,
  email: string
): Promise<{ success: boolean; messageId?: string; error?: string }>
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `name`    | `string` | Yes      | User's name          |
| `email`   | `string` | Yes      | User's email address |

**Returns:**

- `{ success: true, messageId: string }` on success
- `{ success: false, error: string }` on failure

**Example:**

```typescript
import { sendWelcomeEmail } from "@/features/auth";

const result = await sendWelcomeEmail("John Doe", "john@example.com");

if (result.success) {
  console.log("Welcome email sent:", result.messageId);
} else {
  console.error("Failed to send welcome email:", result.error);
}
```

---

## React Hooks

All hooks are located in `hooks/` directory and exported from `hooks/index.ts` and `index.ts`.

### useLogin

Hook for handling user login functionality.

**Signature:**

```typescript
export function useLogin(): UseLoginReturn
```

**UseLoginReturn:**

```typescript
interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Return Values:**

| Property     | Type                                                  | Description                                                                     |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `login`      | `(credentials: LoginCredentials) => Promise<boolean>` | Async function to attempt login. Returns `true` on success, `false` on failure. |
| `isLoading`  | `boolean`                                             | `true` during API call, `false` otherwise                                       |
| `error`      | `string \| null`                                      | Error message if login failed, `null` otherwise                                 |
| `clearError` | `() => void`                                          | Function to clear the error state                                               |

**Example:**

```typescript
import { useLogin } from "@/features/auth";

function LoginForm() {
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({
      email: emailInput.value,
      password: passwordInput.value,
      rememberMe: rememberMeCheckbox.checked,
    });

    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

### useRegister

Hook for handling user registration functionality.

**Signature:**

```typescript
export function useRegister(): UseRegisterReturn
```

**UseRegisterReturn:**

```typescript
interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Return Values:**

| Property     | Type                                       | Description                                                        |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| `register`   | `(data: RegisterData) => Promise<boolean>` | Async function to attempt registration. Returns `true` on success. |
| `isLoading`  | `boolean`                                  | `true` during API call                                             |
| `error`      | `string \| null`                           | Error message if registration failed                               |
| `clearError` | `() => void`                               | Function to clear error state                                      |

**Example:**

```typescript
import { useRegister } from "@/features/auth";

function RegisterForm() {
  const { register, isLoading, error, clearError } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await register({
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    });

    if (success) {
      router.push("/verification-pending");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
```

---

### useForgotPassword

Hook for handling password reset request.

**Signature:**

```typescript
export function useForgotPassword(): UseForgotPasswordReturn
```

**UseForgotPasswordReturn:**

```typescript
interface UseForgotPasswordReturn {
  sendResetEmail: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Return Values:**

| Property         | Type                                  | Description                        |
| ---------------- | ------------------------------------- | ---------------------------------- |
| `sendResetEmail` | `(email: string) => Promise<boolean>` | Async function to send reset email |
| `isLoading`      | `boolean`                             | `true` during API call             |
| `error`          | `string \| null`                      | Error message if failed            |
| `clearError`     | `() => void`                          | Function to clear error state      |

**Example:**

```typescript
import { useForgotPassword } from "@/features/auth";

function ForgotPasswordForm() {
  const { sendResetEmail, isLoading, error, clearError } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await sendResetEmail(emailInput.value);

    if (success) {
      setShowSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input ref={emailInput} type="email" placeholder="Email" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
```

---

### useResetPassword

Hook for handling password reset completion.

**Signature:**

```typescript
export function useResetPassword(): UseResetPasswordReturn
```

**UseResetPasswordReturn:**

```typescript
interface UseResetPasswordReturn {
  reset: (token: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Return Values:**

| Property     | Type                                                       | Description                      |
| ------------ | ---------------------------------------------------------- | -------------------------------- |
| `reset`      | `(token: string, newPassword: string) => Promise<boolean>` | Async function to reset password |
| `isLoading`  | `boolean`                                                  | `true` during API call           |
| `error`      | `string \| null`                                           | Error message if failed          |
| `clearError` | `() => void`                                               | Function to clear error state    |

**Example:**

```typescript
import { useResetPassword } from "@/features/auth";

function ResetPasswordForm({ token }: { token: string }) {
  const { reset, isLoading, error, clearError } = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await reset(token, newPasswordInput.value);

    if (success) {
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input ref={newPasswordInput} type="password" placeholder="New Password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
```

---

### useResendVerification

Hook for resending email verification.

**Signature:**

```typescript
export function useResendVerification(): UseResendVerificationReturn
```

**UseResendVerificationReturn:**

```typescript
interface UseResendVerificationReturn {
  resend: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Return Values:**

| Property     | Type                                  | Description                           |
| ------------ | ------------------------------------- | ------------------------------------- |
| `resend`     | `(email: string) => Promise<boolean>` | Async function to resend verification |
| `isLoading`  | `boolean`                             | `true` during API call                |
| `error`      | `string \| null`                      | Error message if failed               |
| `clearError` | `() => void`                          | Function to clear error state         |

**Example:**

```typescript
import { useResendVerification } from "@/features/auth";

function ResendVerificationForm() {
  const { resend, isLoading, error, clearError } = useResendVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await resend(emailInput.value);

    if (success) {
      setShowSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input ref={emailInput} type="email" placeholder="Email" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Resend Verification"}
      </button>
    </form>
  );
}
```

---

## Components

### LoginPage

Complete login page component with form, validation, and navigation links.

**Signature:**

```typescript
import { LoginPage } from "@/features/auth";
```

**Props:**

```typescript
interface LoginPageProps extends AuthCallbacks, ThemeProps {
  showRegisterLink?: boolean;
  showForgotPasswordLink?: boolean;
  redirectUrl?: string;
}
```

| Prop                     | Type                      | Default   | Description                     |
| ------------------------ | ------------------------- | --------- | ------------------------------- |
| `onSuccess`              | `() => void`              | -         | Callback after successful login |
| `onError`                | `(error: string) => void` | -         | Callback on login error         |
| `showRegisterLink`       | `boolean`                 | `true`    | Show register link              |
| `showForgotPasswordLink` | `boolean`                 | `true`    | Show forgot password link       |
| `redirectUrl`            | `string`                  | -         | URL to redirect after login     |
| `theme`                  | `'light' \| 'dark'`       | `'light'` | Theme variant                   |
| `className`              | `string`                  | -         | Additional CSS classes          |

**Example:**

```tsx
<LoginPage
  onSuccess={() => router.push("/dashboard")}
  onError={(error) => toast.error(error)}
  showRegisterLink={true}
  showForgotPasswordLink={true}
/>
```

---

### RegisterForm

Registration form component with name, email, password fields and validation.

**Signature:**

```typescript
import { RegisterForm } from "@/features/auth";
```

**Props:**

```typescript
interface RegisterFormProps extends AuthCallbacks, ThemeProps {
  defaultEmail?: string;
  defaultName?: string;
  showLoginLink?: boolean;
}
```

| Prop                     | Type                      | Default   | Description                            |
| ------------------------ | ------------------------- | --------- | -------------------------------------- |
| `defaultEmail`           | `string`                  | `''`      | Pre-fill email field                   |
| `defaultName`            | `string`                  | `''`      | Pre-fill name field                    |
| `onSuccess`              | `() => void`              | -         | Callback after successful registration |
| `onError`                | `(error: string) => void` | -         | Callback on error                      |
| `onVerificationRequired` | `() => void`              | -         | Callback when verification needed      |
| `showLoginLink`          | `boolean`                 | `true`    | Show login link                        |
| `theme`                  | `'light' \| 'dark'`       | `'light'` | Theme variant                          |
| `className`              | `string`                  | -         | Additional CSS classes                 |

**Example:**

```tsx
<RegisterForm
  defaultEmail="user@example.com"
  onVerificationRequired={() => router.push("/verification-pending")}
  showLoginLink={true}
/>
```

---

### ForgotPasswordForm

Password recovery form component.

**Signature:**

```typescript
import { ForgotPasswordForm } from "@/features/auth";
```

**Props:**

```typescript
interface ForgotPasswordFormProps extends ThemeProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}
```

| Prop           | Type                | Default   | Description               |
| -------------- | ------------------- | --------- | ------------------------- |
| `onSuccess`    | `() => void`        | -         | Callback after email sent |
| `onLoginClick` | `() => void`        | -         | Callback for login link   |
| `theme`        | `'light' \| 'dark'` | `'light'` | Theme variant             |
| `className`    | `string`            | -         | Additional CSS classes    |

**Example:**

```tsx
<ForgotPasswordForm
  onSuccess={() => setShowSuccess(true)}
  onLoginClick={() => router.push("/login")}
/>
```

---

### ResetPasswordForm

Password reset form component with token support.

**Signature:**

```typescript
import { ResetPasswordForm } from "@/features/auth";
```

**Props:**

```typescript
interface ResetPasswordFormProps extends ThemeProps {
  token?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}
```

| Prop            | Type                | Default   | Description                                      |
| --------------- | ------------------- | --------- | ------------------------------------------------ |
| `token`         | `string`            | -         | Reset token (auto-read from URL if not provided) |
| `onSuccess`     | `() => void`        | -         | Callback after successful reset                  |
| `onBackToLogin` | `() => void`        | -         | Callback for back to login link                  |
| `theme`         | `'light' \| 'dark'` | `'light'` | Theme variant                                    |
| `className`     | `string`            | -         | Additional CSS classes                           |

**Example:**

```tsx
<ResetPasswordForm
  token={resetToken}
  onSuccess={() => router.push("/login")}
/>
```

---

### ResendVerificationForm

Email verification resend form component.

**Signature:**

```typescript
import { ResendVerificationForm } from "@/features/auth";
```

**Props:**

```typescript
interface ResendVerificationFormProps extends ThemeProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}
```

| Prop            | Type                | Default   | Description                     |
| --------------- | ------------------- | --------- | ------------------------------- |
| `onSuccess`     | `() => void`        | -         | Callback after email sent       |
| `onBackToLogin` | `() => void`        | -         | Callback for back to login link |
| `theme`         | `'light' \| 'dark'` | `'light'` | Theme variant                   |
| `className`     | `string`            | -         | Additional CSS classes          |

**Example:**

```tsx
<ResendVerificationForm
  onSuccess={() => toast.success("Verification email sent!")}
  onBackToLogin={() => router.push("/login")}
/>
```

---

### VerifyEmailPage

Email verification success page component.

**Signature:**

```typescript
import { VerifyEmailPage, VerifyEmailPageWrapper } from "@/features/auth";
```

**Props:**

```typescript
interface VerifyEmailPageProps extends ThemeProps {
  callbackUrl?: string;
  onGoToDashboard?: () => void;
}
```

| Prop              | Type                | Default        | Description                   |
| ----------------- | ------------------- | -------------- | ----------------------------- |
| `callbackUrl`     | `string`            | `'/dashboard'` | URL for dashboard button      |
| `onGoToDashboard` | `() => void`        | -              | Callback for dashboard button |
| `theme`           | `'light' \| 'dark'` | `'light'`      | Theme variant                 |
| `className`       | `string`            | -              | Additional CSS classes        |

**Example:**

```tsx
<VerifyEmailPageWrapper
  callbackUrl="/dashboard"
  onGoToDashboard={() => router.push("/dashboard")}
/>
```

---

### PasswordInput

Password input component with visibility toggle.

**Signature:**

```typescript
import { PasswordInput } from "@/features/auth";
```

**Props:**

```typescript
interface PasswordInputProps {
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
  theme?: "light" | "dark";
  className?: string;
}
```

| Prop              | Type                      | Default   | Description             |
| ----------------- | ------------------------- | --------- | ----------------------- |
| `name`            | `string`                  | -         | Field name (required)   |
| `label`           | `string`                  | -         | Label text              |
| `placeholder`     | `string`                  | -         | Placeholder text        |
| `value`           | `string`                  | -         | Controlled value        |
| `onChange`        | `(value: string) => void` | -         | Change handler          |
| `showStrength`    | `boolean`                 | `false`   | Show strength indicator |
| `showConfirm`     | `boolean`                 | `false`   | Show confirm field      |
| `confirmPassword` | `string`                  | -         | Value to compare        |
| `disabled`        | `boolean`                 | `false`   | Disable input           |
| `required`        | `boolean`                 | `false`   | Mark as required        |
| `error`           | `string`                  | -         | Error message           |
| `theme`           | `'light' \| 'dark'`       | `'light'` | Theme variant           |
| `className`       | `string`                  | -         | Additional CSS classes  |

**Example:**

```tsx
<PasswordInput
  name="password"
  label="Password"
  placeholder="Enter your password"
  showStrength={true}
  showConfirm={true}
/>
```

---

### PasswordStrengthIndicator

Password strength visualization component.

**Signature:**

```typescript
import { PasswordStrengthIndicator } from "@/features/auth";
```

**Props:**

```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
  name?: string;
  email?: string;
  oldPassword?: string;
  theme?: "light" | "dark";
  className?: string;
}
```

| Prop          | Type                | Default   | Description                      |
| ------------- | ------------------- | --------- | -------------------------------- |
| `password`    | `string`            | -         | Password to evaluate (required)  |
| `name`        | `string`            | -         | User's name for personalization  |
| `email`       | `string`            | -         | User's email for personalization |
| `oldPassword` | `string`            | -         | Old password to avoid reuse      |
| `theme`       | `'light' \| 'dark'` | `'light'` | Theme variant                    |
| `className`   | `string`            | -         | Additional CSS classes           |

**Example:**

```tsx
<PasswordStrengthIndicator
  password={password}
  email={email}
  theme="dark"
/>
```

---

## Types

### Core Types

```typescript
// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Password reset data
interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

// Password reset email
interface ForgotPasswordEmail {
  email: string;
}

// Password reset token
interface ResetPasswordToken {
  token: string;
  password: string;
}

// Verification email
interface VerificationEmail {
  email: string;
}

// Verification token
interface VerifyEmailToken {
  token: string;
}
```

### Callback Types

```typescript
interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onVerificationRequired?: () => void;
}
```

### Theme Types

```typescript
interface ThemeProps {
  theme?: "light" | "dark";
  className?: string;
}
```

### Response Types

```typescript
interface AuthApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}
```

### Validation Types

```typescript
interface ValidationError {
  field: string;
  message: string;
}
```

---

## Constants

No exported constants. All values are typed and validated through Zod schemas internally.

---

## Error Codes

| Error Type                                    | Message                                              | Action                                     |
| --------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| Invalid email or password Invalid credentials | ""                                                   | User should verify credentials             |
| Unverified email                              | "Please verify your email address before logging in" | User should check email                    |
| Weak password                                 | Zod validation error                                 | User should choose stronger password       |
| Email exists                                  | Better Auth error                                    | User should login or use different email   |
| Invalid token                                 | "Invalid or expired token"                           | User should request new reset/verification |

---

## Version History

| Version | Date       | Changes                                |
| ------- | ---------- | -------------------------------------- |
| 1.0.0   | 2024-01-01 | Initial release                        |
| 1.1.0   | 2024-02-01 | Added social authentication            |
| 1.2.0   | 2024-03-01 | Added password strength indicator      |
| 2.0.0   | 2024-04-01 | Refactored to feature module structure |
