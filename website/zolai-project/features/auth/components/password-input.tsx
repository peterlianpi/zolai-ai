"use client";

import React, { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { PasswordStrengthIndicator } from "@/features/auth/components/password-strength-indicator";

type PasswordFormInstance = {
  register: (name: never) => UseFormRegisterReturn;
  watch: (name: string) => unknown;
  formState: {
    errors: Record<string, unknown>;
  };
};

interface PasswordInputProps {
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  form?: PasswordFormInstance;
  value?: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
  showStrength?: boolean;
  showConfirm?: boolean;
  confirmPassword?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function PasswordInput({
  name,
  id,
  label = "Password",
  placeholder = "Enter your password",
  form,
  value,
  onChange,
  errorMessage,
  showStrength = false,
  showConfirm = false,
  confirmPassword,
  className,
  disabled = false,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldError = form?.formState.errors[name] as FieldError | undefined;
  const inputId = id ?? name;

  return (
    <Field className={className}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          value={form ? undefined : value ?? ""}
          onChange={
            form
              ? undefined
              : (event) => {
                  onChange?.(event.target.value);
                }
          }
          {...(form ? form.register(name as never) : {})}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {showStrength && form && (
        <PasswordStrengthIndicator
          password={String(form.watch(name) ?? "")}
          name={String(form.watch("name") ?? "")}
          email={String(form.watch("email") ?? "")}
          oldPassword={String(form.watch("currentPassword") ?? "")}
        />
      )}
      {showConfirm && form && confirmPassword && (
        <p
          className={`text-sm ${
            String(form.watch(name) ?? "") === confirmPassword
              ? "text-green-500"
              : "text-muted-foreground"
          }`}
        >
          {String(form.watch(name) ?? "") === confirmPassword
            ? "✓ Passwords match"
            : "Passwords do not match"}
        </p>
      )}
      {fieldError && (
        <p className="text-sm text-red-500">
          {fieldError.message}
        </p>
      )}
      {!fieldError && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </Field>
  );
}
