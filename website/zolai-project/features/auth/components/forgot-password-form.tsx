"use client";

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { Captcha } from "@/features/security/components/captcha";
import { cn } from "@/lib/utils";
import type { ForgotPasswordFormProps } from "../types/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  captchaToken: z.string().optional(),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// ============================================
// Forgot Password Form Component
// ============================================

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      captchaToken: "",
    },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
        fetchOptions: {
          headers: {
            ...(values.captchaToken ? { "x-captcha-token": values.captchaToken } : {}),
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setIsSuccess(true);
      toast.success(
        "If an account exists with this email, you will receive a password reset link.",
      );
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (isSuccess) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            If you don&apos;t receive an email within a few minutes, check your spam
            folder or{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              try again
            </Button>
            .
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
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

              {form.formState.errors.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Captcha
                onVerify={(token) => form.setValue("captchaToken", token)}
                onExpire={() => form.setValue("captchaToken", "")}
                action="forgot_password"
              />

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
