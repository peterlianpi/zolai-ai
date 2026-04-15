"use client";

import {
  Controller,
  FieldError,
  useFormContext,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldError as FieldErrorComponent,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

// ============================================
// Types
// ============================================

export interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  placeholder?: string;
  type?: ComponentProps<typeof Input>["type"];
  disabled?: boolean;
  required?: boolean;
  labelSuffix?: React.ReactNode;
}

// ============================================
// Component
// ============================================

export function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  placeholder,
  type = "text",
  disabled,
  required,
  labelSuffix,
}: FormFieldProps<T>) {
  const { control, formState } = useFormContext<T>();

  const fieldError = formState.errors[name] as FieldError | undefined;
  const isInvalid = !!fieldError;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
            {labelSuffix && <span className="ml-2">{labelSuffix}</span>}
          </FieldLabel>
          <Input
            {...field}
            id={field.name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={
              description || isInvalid ? `${field.name}-description` : undefined
            }
          />
          {description && (
            <FieldDescription id={`${field.name}-description`}>
              {description}
            </FieldDescription>
          )}
          {isInvalid && fieldError && (
            <FieldErrorComponent errors={[fieldError]} />
          )}
        </Field>
      )}
    />
  );
}
