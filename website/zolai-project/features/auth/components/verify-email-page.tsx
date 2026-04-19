"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VerifyEmailPageProps } from "../types/auth";

// ============================================
// Verify Email Page Component
// ============================================

export function VerifyEmailPage({
  callbackUrl = "/dashboard",
  onGoToDashboard,
  className,
}: VerifyEmailPageProps) {
  const handleGoToDashboard = () => {
    onGoToDashboard?.();
    window.location.href = callbackUrl;
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Email Verified!</CardTitle>
        <CardDescription>
          Your email has been successfully verified. You now have full access to
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
          <p className="text-sm">
            Thank you for verifying your email address. You can now:
          </p>
          <ul className="mt-2 list-disc pl-4 text-sm">
            <li>Access all features of your account</li>
            <li>Set up your profile and preferences</li>
            <li>Start using the dashboard</li>
          </ul>
        </div>

        <Button className="w-full" onClick={handleGoToDashboard}>
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "/settings";
            }}
          >
            Complete Your Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Verify Email Page Wrapper with Suspense
// ============================================

type VerifyEmailPageWrapperProps = VerifyEmailPageProps;

export function VerifyEmailPageWrapper(props: VerifyEmailPageWrapperProps) {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <VerifyEmailPage
        {...props}
        callbackUrl={props.callbackUrl || "/dashboard"}
      />
    </Suspense>
  );
}
