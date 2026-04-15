"use client";

import { useState } from "react";
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
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { PasswordInput } from "@/features/auth/components/password-input";
import { ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";

// ============================================
// Zod Schema
// ============================================

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ============================================
// Component
// ============================================

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { setError } = form;

  const onSubmit = async (values: ChangePasswordValues) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });

      if (error) {
        setError("root", {
          message: error.message || "Failed to change password",
        });
        toast.error(error.message || "Failed to change password");
        return;
      }

      setIsSuccess(true);
      toast.success("Password changed successfully!");
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-0">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-muted-foreground">
              Update your account password
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Password Changed Successfully</CardTitle>
              <CardDescription>
                Your password has been updated. If you&apos;re logged in on
                other devices, you may need to log in again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link href="/settings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-muted-foreground">
              Update your account password
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="space-y-4">
                  <PasswordInput
                    name="currentPassword"
                    label="Current Password"
                    placeholder="Enter your current password"
                    form={form}
                    required
                  />
                  <PasswordInput
                    name="password"
                    label="New Password"
                    placeholder="Create a new password"
                    form={form}
                    showStrength
                    required
                  />
                  <PasswordInput
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    form={form}
                    showConfirm
                    confirmPassword={form.watch("password")}
                    required
                  />
                  {form.formState.errors.root && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.root.message}
                    </p>
                  )}
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                    <Button variant="outline" type="button" asChild>
                      <Link href="/settings">Cancel</Link>
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
