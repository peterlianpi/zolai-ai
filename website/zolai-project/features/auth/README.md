# Authentication Feature Module

Self-contained authentication components, hooks, and types for the Zolai AI application. Built with React, Next.js, Better Auth, React Hook Form, and Zod.

## Overview

The authentication feature module provides a complete, reusable authentication system that can be dropped into any page or application. All components include their own state management, validation, and error handling.

### Key Principles

- **Self-contained**: Components encapsulate all necessary logic, state, and UI
- **Reusable**: No page-specific dependencies; works in any context
- **Encapsulated**: Internal implementation details are hidden behind clean APIs
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Accessible**: Follows WAI-ARIA guidelines with proper keyboard navigation

## Architecture

### Directory Structure

```
features/auth/
├── components/              # UI Components
│   ├── login-page.tsx       # Complete login page with form
│   ├── login-form.tsx       # Standalone login form (backward compat)
│   ├── register-form.tsx    # Registration form with validation
│   ├── signup-form.tsx      # Standalone signup form (backward compat)
│   ├── forgot-password-form.tsx    # Password recovery form
│   ├── reset-password-form.tsx    # Password reset form
│   ├── verify-email-page.tsx      # Email verification success page
│   ├── verify-email-page-wrapper.tsx  # Verification page with token handling
│   ├── resend-verification-form.tsx   # Resend verification email form
│   ├── password-input.tsx   # Password input with visibility toggle
│   └── password-strength-indicator.tsx  # Password strength meter
├── hooks/                   # React hooks for auth logic
│   ├── index.ts            # Hook exports
│   ├── use-login.ts        # Login authentication hook
│   ├── use-register.ts     # Registration hook
│   ├── use-forgot-password.ts  # Password recovery hook
│   ├── use-reset-password.ts   # Password reset hook
│   └── use-resend-verification.ts  # Email verification hook
├── lib/                    # API layer
│   └── auth-api.ts         # Auth-related API functions
├── types/                  # TypeScript types
│   └── auth.ts             # All auth type definitions
├── index.ts                # Main export file
└── README.md               # This file
```

### Component Hierarchy

```
LoginPage
├── LoginForm
│   ├── EmailInput
│   ├── PasswordInput
│   └── RememberMeCheckbox
├── RegisterLink
└── ForgotPasswordLink

RegisterForm
├── NameInput
├── EmailInput
├── PasswordInput (with strength indicator)
└── ConfirmPasswordInput

ForgotPasswordForm
├── EmailInput
└── BackToLoginLink

ResetPasswordForm
├── PasswordInput (with strength indicator)
├── ConfirmPasswordInput
└── SubmitButton

ResendVerificationForm
├── EmailInput
└── SubmitButton

VerifyEmailPage
├── SuccessMessage
└── GoToDashboardButton
```

### API Layer Design

The API layer (`lib/auth-api.ts`) follows a consistent pattern:

1. **Async functions** that return `Promise<AuthApiResponse<T>>`
2. **Error handling** with user-friendly messages
3. **Type-safe responses** with generic support
4. **Integration with Better Auth** for authentication

### Hook Patterns

All hooks follow the same pattern:

```typescript
interface UseXxxReturn {
  xxx: (data: XxxData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

## Installation & Setup

The module is already configured in the project. Ensure these dependencies are installed:

```bash
bun add react react-dom next react-hook-form @hookform/resolvers zod zustand better-auth sonner lucide-react
```

## Usage Examples

### Basic Login Page

```tsx
"use client";

import { LoginPage } from "@/features/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPageWrapper() {
  const router = useRouter();

  return (
    <LoginPage
      onSuccess={() => router.push("/dashboard")}
      onError={(error) => toast.error(error)}
      showRegisterLink={true}
      showForgotPasswordLink={true}
    />
  );
}
```

### Registration Form with Custom Callbacks

```tsx
"use client";

import { RegisterForm } from "@/features/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPageWrapper() {
  const router = useRouter();

  return (
    <RegisterForm
      defaultEmail=""
      defaultName=""
      onSuccess={() => {
        toast.success("Account created successfully!");
        router.push("/verification-pending");
      }}
      onError={(error) => toast.error(error)}
      onVerificationRequired={() => router.push("/verification-pending")}
      showLoginLink={true}
      theme="light"
    />
  );
}
```

### Password Recovery Flow

```tsx
"use client";

import { ForgotPasswordForm } from "@/features/auth";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <div className="text-center">
        <h2>Check your email</h2>
        <p>We've sent you a password reset link.</p>
      </div>
    );
  }

  return (
    <ForgotPasswordForm
      onSuccess={() => {
        toast.success("Password reset email sent!");
        setShowSuccess(true);
      }}
      onLoginClick={() => window.location.href = "/login"}
      theme="dark"
    />
  );
}
```

### Password Reset with Token

```tsx
"use client";

import { ResetPasswordForm } from "@/features/auth";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  return (
    <ResetPasswordForm
      token={token}
      onSuccess={() => {
        toast.success("Password reset successfully!");
        router.push("/login");
      }}
      onBackToLogin={() => router.push("/login")}
    />
  );
}
```

### Email Verification Page

```tsx
"use client";

import { VerifyEmailPageWrapper } from "@/features/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <VerifyEmailPageWrapper
      callbackUrl={callbackUrl}
      onGoToDashboard={() => router.push(callbackUrl)}
    />
  );
}
```

### Resend Verification Email

```tsx
"use client";

import { ResendVerificationForm } from "@/features/auth";
import { useState } from "react";
import { toast } from "sonner";

export default function ResendVerificationPage() {
  const [emailSent, setEmailSent] = useState(false);

  return (
    <ResendVerificationForm
      onSuccess={() => {
        toast.success("Verification email sent!");
        setEmailSent(true);
      }}
      onBackToLogin={() => window.location.href = "/login"}
    />
  );
}
```

### Using Hooks Directly

```tsx
"use client";

import { useLogin } from "@/features/auth";
import { useState } from "react";

export function LoginComponent() {
  const { login, isLoading, error, clearError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({ email, password });

    if (success) {
      // Redirect or update UI on successful login
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isLoading}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Social Authentication

```tsx
"use client";

import { signInWithSocial } from "@/features/auth";

export function SocialLoginButtons() {
  const handleGoogleSignIn = async () => {
    await signInWithSocial("google");
  };

  const handleGithubSignIn = async () => {
    await signInWithSocial("github");
  };

  const handleDiscordSignIn = async () => {
    await signInWithSocial("discord");
  };

  return (
    <div className="flex gap-4">
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleGithubSignIn}>Sign in with GitHub</button>
      <button onClick={handleDiscordSignIn}>Sign in with Discord</button>
    </div>
  );
}
```

## Props Documentation

### LoginPageProps

| Prop                     | Type                      | Default   | Required | Description                           |
| ------------------------ | ------------------------- | --------- | -------- | ------------------------------------- |
| `onSuccess`              | `() => void`              | -         | No       | Callback fired after successful login |
| `onError`                | `(error: string) => void` | -         | No       | Callback fired on login error         |
| `showRegisterLink`       | `boolean`                 | `true`    | No       | Show/hide the register link           |
| `showForgotPasswordLink` | `boolean`                 | `true`    | No       | Show/hide the forgot password link    |
| `redirectUrl`            | `string`                  | -         | No       | URL to redirect after login           |
| `theme`                  | `'light' \| 'dark'`       | `'light'` | No       | Theme variant for styling             |
| `className`              | `string`                  | -         | No       | Additional CSS classes                |

### RegisterFormProps

| Prop                     | Type                      | Default   | Required | Description                                  |
| ------------------------ | ------------------------- | --------- | -------- | -------------------------------------------- |
| `defaultEmail`           | `string`                  | `''`      | No       | Pre-fill email field value                   |
| `defaultName`            | `string`                  | `''`      | No       | Pre-fill name field value                    |
| `onSuccess`              | `() => void`              | -         | No       | Callback fired after successful registration |
| `onError`                | `(error: string) => void` | -         | No       | Callback fired on registration error         |
| `onVerificationRequired` | `() => void`              | -         | No       | Callback when email verification is needed   |
| `showLoginLink`          | `boolean`                 | `true`    | No       | Show/hide the login link                     |
| `theme`                  | `'light' \| 'dark'`       | `'light'` | No       | Theme variant for styling                    |
| `className`              | `string`                  | -         | No       | Additional CSS classes                       |

### ForgotPasswordFormProps

| Prop           | Type                | Default   | Required | Description                        |
| -------------- | ------------------- | --------- | -------- | ---------------------------------- |
| `onSuccess`    | `() => void`        | -         | No       | Callback fired after email is sent |
| `onLoginClick` | `() => void`        | -         | No       | Callback for login link click      |
| `theme`        | `'light' \| 'dark'` | `'light'` | No       | Theme variant for styling          |
| `className`    | `string`            | -         | No       | Additional CSS classes             |

### ResetPasswordFormProps

| Prop            | Type                | Default   | Required | Description                           |
| --------------- | ------------------- | --------- | -------- | ------------------------------------- |
| `token`         | `string`            | -         | No       | Password reset token from email       |
| `onSuccess`     | `() => void`        | -         | No       | Callback fired after successful reset |
| `onBackToLogin` | `() => void`        | -         | No       | Callback for back to login link       |
| `theme`         | `'light' \| 'dark'` | `'light'` | No       | Theme variant for styling             |
| `className`     | `string`            | -         | No       | Additional CSS classes                |

### ResendVerificationFormProps

| Prop            | Type                | Default   | Required | Description                        |
| --------------- | ------------------- | --------- | -------- | ---------------------------------- |
| `onSuccess`     | `() => void`        | -         | No       | Callback fired after email is sent |
| `onBackToLogin` | `() => void`        | -         | No       | Callback for back to login link    |
| `theme`         | `'light' \| 'dark'` | `'light'` | No       | Theme variant for styling          |
| `className`     | `string`            | -         | No       | Additional CSS classes             |

### VerifyEmailPageProps

| Prop              | Type                | Default        | Required | Description                         |
| ----------------- | ------------------- | -------------- | -------- | ----------------------------------- |
| `callbackUrl`     | `string`            | `'/dashboard'` | No       | URL to redirect after verification  |
| `onGoToDashboard` | `() => void`        | -              | No       | Callback for dashboard button click |
| `theme`           | `'light' \| 'dark'` | `'light'`      | No       | Theme variant for styling           |
| `className`       | `string`            | -              | No       | Additional CSS classes              |

### PasswordInputProps

| Prop              | Type                      | Default   | Required | Description                         |
| ----------------- | ------------------------- | --------- | -------- | ----------------------------------- |
| `name`            | `string`                  | -         | Yes      | Field name for form registration    |
| `label`           | `string`                  | -         | No       | Label text for the input            |
| `placeholder`     | `string`                  | -         | No       | Placeholder text                    |
| `value`           | `string`                  | -         | No       | Controlled value                    |
| `onChange`        | `(value: string) => void` | -         | No       | Change handler for controlled input |
| `showStrength`    | `boolean`                 | `false`   | No       | Show password strength indicator    |
| `showConfirm`     | `boolean`                 | `false`   | No       | Show confirm password field         |
| `confirmPassword` | `string`                  | -         | No       | Value to compare against            |
| `disabled`        | `boolean`                 | `false`   | No       | Disable the input                   |
| `required`        | `boolean`                 | `false`   | No       | Mark field as required              |
| `error`           | `string`                  | -         | No       | Error message to display            |
| `theme`           | `'light' \| 'dark'`       | `'light'` | No       | Theme variant                       |
| `className`       | `string`                  | -         | No       | Additional CSS classes              |

### PasswordStrengthIndicatorProps

| Prop          | Type                | Default   | Required | Description                      |
| ------------- | ------------------- | --------- | -------- | -------------------------------- |
| `password`    | `string`            | -         | Yes      | Password to evaluate             |
| `name`        | `string`            | -         | No       | User's name for personalization  |
| `email`       | `string`            | -         | No       | User's email for personalization |
| `oldPassword` | `string`            | -         | No       | Old password to avoid reuse      |
| `theme`       | `'light' \| 'dark'` | `'light'` | No       | Theme variant                    |
| `className`   | `string`            | -         | No       | Additional CSS classes           |

## Hooks Reference

### useLogin

Authentication hook for user login.

```typescript
import { useLogin } from "@/features/auth";

const { login, isLoading, error, clearError } = useLogin();
```

**Return Values:**

| Property     | Type                                                  | Description                                 |
| ------------ | ----------------------------------------------------- | ------------------------------------------- |
| `login`      | `(credentials: LoginCredentials) => Promise<boolean>` | Login function that returns true on success |
| `isLoading`  | `boolean`                                             | Loading state during API call               |
| `error`      | `string \| null`                                      | Error message if login failed               |
| `clearError` | `() => void`                                          | Function to clear error state               |

### useRegister

Authentication hook for user registration.

```typescript
import { useRegister } from "@/features/auth";

const { register, isLoading, error, clearError } = useRegister();
```

**Return Values:**

| Property     | Type                                       | Description                                    |
| ------------ | ------------------------------------------ | ---------------------------------------------- |
| `register`   | `(data: RegisterData) => Promise<boolean>` | Register function that returns true on success |
| `isLoading`  | `boolean`                                  | Loading state during API call                  |
| `error`      | `string \| null`                           | Error message if registration failed           |
| `clearError` | `() => void`                               | Function to clear error state                  |

### useForgotPassword

Hook for initiating password reset.

```typescript
import { useForgotPassword } from "@/features/auth";

const { sendResetEmail, isLoading, error, clearError } = useForgotPassword();
```

**Return Values:**

| Property         | Type                                  | Description                   |
| ---------------- | ------------------------------------- | ----------------------------- |
| `sendResetEmail` | `(email: string) => Promise<boolean>` | Send reset email function     |
| `isLoading`      | `boolean`                             | Loading state during API call |
| `error`          | `string \| null`                      | Error message if failed       |
| `clearError`     | `() => void`                          | Function to clear error state |

### useResetPassword

Hook for completing password reset with token.

```typescript
import { useResetPassword } from "@/features/auth";

const { reset, isLoading, error, clearError } = useResetPassword();
```

**Return Values:**

| Property     | Type                                                       | Description                   |
| ------------ | ---------------------------------------------------------- | ----------------------------- |
| `reset`      | `(token: string, newPassword: string) => Promise<boolean>` | Reset password function       |
| `isLoading`  | `boolean`                                                  | Loading state during API call |
| `error`      | `string \| null`                                           | Error message if reset failed |
| `clearError` | `() => void`                                               | Function to clear error state |

### useResendVerification

Hook for resending email verification.

```typescript
import { useResendVerification } from "@/features/auth";

const { resend, isLoading, error, clearError } = useResendVerification();
```

**Return Values:**

| Property     | Type                                  | Description                        |
| ------------ | ------------------------------------- | ---------------------------------- |
| `resend`     | `(email: string) => Promise<boolean>` | Resend verification email function |
| `isLoading`  | `boolean`                             | Loading state during API call      |
| `error`      | `string \| null`                      | Error message if failed            |
| `clearError` | `() => void`                          | Function to clear error state      |

## API Reference

All API functions are exported from `lib/auth-api.ts` and re-exported from `index.ts`.

### login

Authenticate a user with email and password.

```typescript
import { login } from "@/features/auth";

const result = await login({
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
});
```

**Parameters:**

| Parameter                | Type      | Required | Description          |
| ------------------------ | --------- | -------- | -------------------- |
| `credentials.email`      | `string`  | Yes      | User's email address |
| `credentials.password`   | `string`  | Yes      | User's password      |
| `credentials.rememberMe` | `boolean` | No       | Remember the session |

**Returns:** `Promise<AuthApiResponse<{ user?: unknown; session?: unknown }>>`

---

### register

Create a new user account.

```typescript
import { register } from "@/features/auth";

const result = await register({
  name: "John Doe",
  email: "user@example.com",
  password: "securePassword123",
  confirmPassword: "securePassword123",
});
```

**Parameters:**

| Parameter              | Type     | Required | Description           |
| ---------------------- | -------- | -------- | --------------------- |
| `data.name`            | `string` | Yes      | User's full name      |
| `data.email`           | `string` | Yes      | User's email address  |
| `data.password`        | `string` | Yes      | User's password       |
| `data.confirmPassword` | `string` | Yes      | Password confirmation |

**Returns:** `Promise<AuthApiResponse<{ user?: unknown; session?: unknown }>>`

---

### forgotPassword

Initiate password reset by sending a reset email.

```typescript
import { forgotPassword } from "@/features/auth";

const result = await forgotPassword("user@example.com");
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `email`   | `string` | Yes      | User's email address |

**Returns:** `Promise<AuthApiResponse>`

---

### resetPassword

Reset a user's password using a reset token.

```typescript
import { resetPassword } from "@/features/auth";

const result = await resetPassword(token, "newPassword123");
```

**Parameters:**

| Parameter     | Type     | Required | Description            |
| ------------- | -------- | -------- | ---------------------- |
| `token`       | `string` | Yes      | Reset token from email |
| `newPassword` | `string` | Yes      | New password           |

**Returns:** `Promise<AuthApiResponse>`

---

### verifyEmail

Verify a user's email address.

```typescript
import { verifyEmail } from "@/features/auth";

const result = await verifyEmail(token);
```

**Parameters:**

| Parameter | Type     | Required | Description                   |
| --------- | -------- | -------- | ----------------------------- |
| `token`   | `string` | Yes      | Verification token from email |

**Returns:** `Promise<AuthApiResponse<{ status: boolean }>>`

---

### resendVerificationEmail

Resend the verification email.

```typescript
import { resendVerificationEmail } from "@/features/auth";

const result = await resendVerificationEmail("user@example.com");
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `email`   | `string` | Yes      | User's email address |

**Returns:** `Promise<AuthApiResponse>`

---

### signOut

Sign out the current user.

```typescript
import { signOut } from "@/features/auth";

const result = await signOut();
```

**Returns:** `Promise<AuthApiResponse>`

---

### signInWithSocial

Sign in with a social provider.

```typescript
import { signInWithSocial } from "@/features/auth";

// Google
await signInWithSocial("github");

// Discord
await signInWithSocial("discord");
```

**Parameters:**

| Parameter  | Type                                | Required | Description     |
| ---------- | ----------------------------------- | -------- | --------------- |
| `provider` | `'github' \| 'discord'` | Yes      | Social provider |

**Returns:** `Promise<void>`

---

### sendWelcomeEmail

Send a welcome email to a new user.

```typescript
import { sendWelcomeEmail } from "@/features/auth";

const result = await sendWelcomeEmail("John Doe", "user@example.com");
```

**Parameters:**

| Parameter | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `name`    | `string` | Yes      | User's name          |
| `email`   | `string` | Yes      | User's email address |

**Returns:** `Promise<{ success: boolean; messageId?: string; error?: string }>`

## Type Definitions

### LoginCredentials

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

### RegisterData

```typescript
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

### AuthApiResponse

```typescript
interface AuthApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### AuthState

```typescript
interface AuthState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}
```

## Integration Guide

### Using in Pages

Import and use components directly in your Next.js pages:

```tsx
// app/login/page.tsx
import { LoginPage } from "@/features/auth";

export default function Login() {
  return <LoginPage />;
}
```

### Customizing Behavior

Use callback props to customize behavior:

```tsx
<LoginPage
  onSuccess={() => {
    // Custom redirect logic
    window.location.href = "/dashboard";
  }}
  onError={(error) => {
    // Custom error handling
    console.error("Login failed:", error);
  }}
/>
```

### Theme Customization

Apply custom CSS classes or use the theme prop:

```tsx
<LoginPage
  theme="dark"
  className="max-w-md mx-auto my-10"
/>
```

### Password Strength Validation

Use the password strength indicator for better security:

```tsx
import { PasswordStrengthIndicator } from "@/features/auth";

<PasswordStrengthIndicator
  password={password}
  email={email}
  showFeedback={true}
/>
```

## Migration from Old Components

Legacy components are still exported for backward compatibility:

- `LoginForm` → Use `LoginPage` for complete login page
- `SignupForm` → Use `RegisterForm` for registration

```tsx
// Old (still works)
import { LoginForm } from "@/features/auth";

// New (recommended)
import { LoginPage } from "@/features/auth";
```

## Dependencies

- **React** - UI library
- **Next.js** - React framework
- **Better Auth** - Authentication framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **shadcn/ui** - UI components

## Validation

All forms use Zod schemas for validation:

- **Login**: Email (valid), Password (required)
- **Register**: Name (required), Email (valid), Password (strength requirements)
- **Forgot Password**: Email (valid)
- **Reset Password**: Password (strength requirements), Confirm Password (matches)

## Error Handling

All API functions return consistent `AuthApiResponse` objects:

```typescript
{
  success: true,
  data?: T,
  error?: string
}
```

Components handle errors gracefully and display user-friendly messages.

## Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management during form submission
- Screen reader compatible
- Contrast ratios meet WCAG guidelines

## Contributing

When adding new features to the auth module:

1. Add types to `types/auth.ts`
2. Create API functions in `lib/auth-api.ts`
3. Create hooks in `hooks/` directory
4. Create components in `components/` directory
5. Export from `index.ts`
6. Update documentation in `README.md` and `API.md`
