"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { toast } from "sonner";
import { FormField } from "@/features/form/components";
import { Captcha } from "@/features/security/components/captcha";
import { PasswordInput } from "./password-input";

import { sendWelcomeEmail } from "../lib/auth-api";

// ============================================
// Zod Schema
// ============================================

const signupFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    captchaToken: z.string().min(1, "Please complete the CAPTCHA verification"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

// ============================================
// Component
// ============================================

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      captchaToken: "",
    },
  });

  const { setError } = form;

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError("root", { message: error.message || "Failed to create account" });
        toast.error(error.message || "Failed to create account");
        return;
      }

      // Send welcome email (verification is sent automatically by Better Auth)
      sendWelcomeEmail(values.name, values.email).catch(() => {});

      toast.success("Account created! Please check your email to verify your account.");
      router.push("/verification-pending");
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              <FormField
                name="name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                disabled={isLoading}
                required
              />
              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="m@example.com"
                disabled={isLoading}
                required
              />
              <PasswordInput
                name="password"
                label="Password"
                placeholder="Create a password"
                form={form}
                showStrength
                disabled={isLoading}
                required
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                form={form}
                disabled={isLoading}
                required
              />
              
              {/* CAPTCHA */}
              <Field>
                <FieldLabel>Security Verification</FieldLabel>
                <Captcha
                  onVerify={(token) => form.setValue("captchaToken", token)}
                  onExpire={() => form.setValue("captchaToken", "")}
                  onError={() => {
                    form.setValue("captchaToken", "");
                    toast.error("CAPTCHA verification failed. Please try again.");
                  }}
                />
                {form.formState.errors.captchaToken && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.captchaToken.message}
                  </p>
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
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4">
                      Sign in
                    </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
