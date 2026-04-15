"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Shield, Smartphone, Mail, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TwoFactorVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type VerificationMethod = "totp" | "backup" | "email";

export function TwoFactorVerification({ onSuccess, onCancel }: TwoFactorVerificationProps) {
  const router = useRouter();
  const [method, setMethod] = useState<VerificationMethod>("totp");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleVerification = async () => {
    if (!code || (method !== "backup" && code.length !== 6) || (method === "backup" && code.length < 6)) {
      setError(`Please enter a valid ${method === "backup" ? "backup" : "6-digit"} code`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;

      switch (method) {
        case "totp":
          response = await authClient.twoFactor.verifyTotp({
            code,
            trustDevice: false, // Can be made configurable
          });
          break;
        
        case "backup":
          response = await authClient.twoFactor.verifyBackupCode({
            code,
            trustDevice: false,
          });
          break;
        
        case "email":
          response = await authClient.twoFactor.verifyOtp({
            code,
          });
          break;
      }

      if (response?.error) {
        setError(response.error.message || "Invalid verification code");
      } else {
        toast.success("Verification successful!");
        onSuccess?.();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to verify code");
      console.error("2FA verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authClient.twoFactor.sendOtp();
      
      if (response?.error) {
        setError(response.error.message || "Failed to send email OTP");
      } else {
        setEmailSent(true);
        setMethod("email");
        toast.success("Email OTP sent successfully!");
      }
    } catch (err) {
      setError("Failed to send email OTP");
      console.error("Email OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (methodType: VerificationMethod) => {
    switch (methodType) {
      case "totp":
        return <Smartphone className="h-4 w-4" />;
      case "backup":
        return <Key className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (methodType: VerificationMethod) => {
    switch (methodType) {
      case "totp":
        return "Authenticator App";
      case "backup":
        return "Backup Code";
      case "email":
        return "Email OTP";
    }
  };

  const getCodePlaceholder = () => {
    switch (method) {
      case "totp":
        return "000000";
      case "backup":
        return "Enter backup code";
      case "email":
        return "000000";
    }
  };

  const getCodeLabel = () => {
    switch (method) {
      case "totp":
        return "Enter code from your authenticator app";
      case "backup":
        return "Enter one of your backup codes";
      case "email":
        return "Enter code from your email";
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Please verify your identity to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="grid grid-cols-1 gap-3">
            {/* TOTP Method */}
            <button
              type="button"
              onClick={() => {
                setMethod("totp");
                setCode("");
                setError(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                method === "totp" && "border-primary bg-primary/5"
              )}
            >
              {getMethodIcon("totp")}
              <div>
                <div className="font-medium">{getMethodLabel("totp")}</div>
                <div className="text-sm text-muted-foreground">Use your authenticator app</div>
              </div>
            </button>

            {/* Email OTP Method */}
            <button
              type="button"
              onClick={() => {
                if (emailSent) {
                  setMethod("email");
                  setCode("");
                  setError(null);
                } else {
                  handleSendEmailOTP();
                }
              }}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                method === "email" && "border-primary bg-primary/5"
              )}
            >
              {getMethodIcon("email")}
              <div>
                <div className="font-medium">{getMethodLabel("email")}</div>
                <div className="text-sm text-muted-foreground">
                  {emailSent ? "Check your email for the code" : "Send code to your email"}
                </div>
              </div>
            </button>

            {/* Backup Code Method */}
            <button
              type="button"
              onClick={() => {
                setMethod("backup");
                setCode("");
                setError(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                method === "backup" && "border-primary bg-primary/5"
              )}
            >
              {getMethodIcon("backup")}
              <div>
                <div className="font-medium">{getMethodLabel("backup")}</div>
                <div className="text-sm text-muted-foreground">Use a backup code</div>
              </div>
            </button>
          </div>

          <Separator />

          {/* Code Input */}
          <div className="space-y-3">
            <Label htmlFor="verification-code">{getCodeLabel()}</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder={getCodePlaceholder()}
              maxLength={method === "backup" ? 20 : 6}
              value={code}
              onChange={(e) => {
                const value = method === "backup" 
                  ? e.target.value.replace(/[^a-zA-Z0-9]/g, '') 
                  : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError(null);
              }}
              className={cn(
                method !== "backup" && "text-center text-2xl tracking-widest",
                error && "border-red-500"
              )}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
              disabled={isLoading || !code || (method !== "backup" && code.length !== 6)}
              className="flex-1"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            Having trouble? Contact support for assistance.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}