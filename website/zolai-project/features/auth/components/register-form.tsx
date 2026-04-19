"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { toast } from "sonner";
import { sendWelcomeEmail, resendVerificationEmail } from "../lib/auth-api";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordStrengthIndicator } from "@/features/auth/components/password-strength-indicator";
import { cn } from "@/lib/utils";
import type { RegisterFormProps } from "../types/auth";

// ============================================
// Zod Schema
// ============================================

const registerFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

import { AuthErrorBoundary } from "./auth-error-boundary";

// ============================================
// Register Form Wrapper
// ============================================

export function RegisterForm(props: RegisterFormProps) {
  return (
    <AuthErrorBoundary>
      <RegisterFormComponent {...props} />
    </AuthErrorBoundary>
  );
}

function RegisterFormComponent({
  defaultEmail = "",
  defaultName = "",
  showLoginLink = true,
  className,
}: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      password: "",
      confirmPassword: "",
    },
  });

  const { setError } = form;

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError("root", {
          message: error.message || "Failed to create account",
        });
        toast.error(error.message || "Failed to create account");
        return;
      }

      // Try to send emails but don't block on failure
      try {
        await resendVerificationEmail(values.email);
      } catch (e) {
        console.error("[Signup] Failed to send verification email:", e);
      }

      try {
        await sendWelcomeEmail(values.name, values.email);
      } catch (e) {
        console.error("[Signup] Failed to send welcome email:", e);
      }

      toast.success(
        "Account created! Please check your email to verify your account.",
      );
      router.push("/verification-pending");
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <PasswordInput
                  name="password"
                  label="Password"
                  placeholder="Create a password"
                  disabled={isLoading}
                  form={form}
                />
                <PasswordStrengthIndicator
                  password={form.watch("password") || ""}
                  name={form.watch("name") || ""}
                  email={form.watch("email") || ""}
                />
              </Field>

              <Field>
                <PasswordInput
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  form={form}
                />
                {form.watch("confirmPassword") &&
                  form.watch("password") !== form.watch("confirmPassword") && (
                    <p className="text-sm text-red-500">
                      Passwords do not match
                    </p>
                  )}
                {form.watch("confirmPassword") &&
                  form.watch("password") === form.watch("confirmPassword") &&
                  form.watch("password").length > 0 && (
                    <p className="text-sm text-green-500">✓ Passwords match</p>
                  )}
              </Field>

              {form.formState.errors.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                {showLoginLink && (
                  <p className="px-2 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4">
                      Sign in
                    </Link>
                  </p>
                )}
              </Field>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
