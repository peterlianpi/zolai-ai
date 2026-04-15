"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { FormField } from "@/features/form/components";
import { TwoFactorVerification } from "./two-factor-verification";
import { PasswordInput } from "./password-input";

// ============================================
// Zod Schema
// ============================================

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// ============================================
// Auto-dismiss error bar component
// ============================================

function AutoDismissError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const duration = 10000;
    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        onDismiss();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [message, onDismiss]);

  const isVerification =
    message.toLowerCase().includes("verify your email") ||
    message.toLowerCase().includes("verification required") ||
    message.toLowerCase().includes("email not verified");

  return (
    <div className="relative overflow-hidden rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-900">
      <div className="p-3">
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        {isVerification && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            <a
              href="/verification-pending"
              className="underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Click here to resend verification email
            </a>
          </p>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400 transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

import { AuthErrorBoundary } from "./auth-error-boundary";

// ============================================
// Component Wrapper
// ============================================

export function LoginForm(props: React.ComponentProps<"div">) {
  return (
    <AuthErrorBoundary>
      <LoginFormComponent {...props} />
    </AuthErrorBoundary>
  );
}

function LoginFormComponent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { setError, clearErrors } = form;

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    clearErrors("root");

    try {
      const checkRes = await client.api["check-verification"].$post({ json: { email: values.email } });
      const checkData = await checkRes.json() as { data: { exists: boolean; unverified: boolean } };

      if (checkData.data.unverified) {
        setError("root", {
          message:
            "Please verify your email address before logging in. Check your email for the verification link.",
        });
        toast.error("Email verification required", { duration: 10000 });
        setIsLoading(false);
        return;
      }

      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setShow2FA(true);
        return;
      }

      if (error) {
        const errorMsg = error.message?.toLowerCase() || "";
        
        // Check if this is a 2FA required error
        if (errorMsg.includes("two-factor") || errorMsg.includes("2fa") || error.message?.includes("TWO_FACTOR_REQUIRED")) {
          setShow2FA(true);
          return;
        }
        
        if (
          errorMsg.includes("rate") ||
          errorMsg.includes("too many") ||
          errorMsg.includes("locked")
        ) {
          setError("root", {
            message:
              "Too many login attempts. Please wait a moment before trying again.",
          });
          toast.error("Too many login attempts. Please try again later.", { duration: 10000 });
        } else {
          setError("root", { message: "Invalid email or password" });
          toast.error("Invalid email or password", { duration: 10000 });
        }
        return;
      }

      toast.success("Login successful!", { duration: 10000 });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      toast.error("An unexpected error occurred", { duration: 10000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = () => {
    toast.success("Login successful!");
    router.push(redirectTo);
    router.refresh();
  };

  const handle2FACancel = () => {
    setShow2FA(false);
  };

  // Show 2FA verification if required
  if (show2FA) {
    return (
      <div className={cn("flex flex-col gap-4", className)} {...props}>
        <TwoFactorVerification 
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="gap-4">
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
                  placeholder="Enter your password"
                  form={form}
                  disabled={isLoading}
                />
                <p className="text-sm text-right">
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={form.watch("rememberMe")}
                    onCheckedChange={(checked) =>
                      form.setValue("rememberMe", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                {form.formState.errors.root && (
                  <AutoDismissError
                    message={form.formState.errors.root.message!}
                    onDismiss={() => clearErrors("root")}
                  />
                )}
                <FieldGroup className="gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </p>
                </FieldGroup>
              </FieldGroup>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
