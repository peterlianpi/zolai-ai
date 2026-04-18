"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
import { Copy, Download, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";

interface TOTPSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Helper function to extract secret from TOTP URI
function extractSecretFromUri(uri: string): string {
  try {
    const url = new URL(uri);
    return url.searchParams.get('secret') || '';
  } catch {
    return '';
  }
}

export function TOTPSetup({ onComplete, onCancel }: TOTPSetupProps) {
  const [step, setStep] = useState<"confirm" | "setup" | "verify" | "backup" | "complete">("confirm");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);

  const generateSetup = async () => {
    if (!password.trim()) {
      setError("Please enter your account password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Better Auth returns enrollment data (TOTP URI + backup codes) from enable().
      const enableResponse = await authClient.twoFactor.enable({
        password,
      });

      if (enableResponse?.error) {
        setError(enableResponse.error.message || "Failed to enable two-factor authentication");
        return;
      }

      const enableData = enableResponse?.data as
        | { totpURI?: string; backupCodes?: string[] }
        | undefined;

      if (enableData?.totpURI && enableData?.backupCodes?.length) {
        const secret = extractSecretFromUri(enableData.totpURI);

        setSetupData({
          secret,
          qrCode: enableData.totpURI,
          backupCodes: enableData.backupCodes,
        });
        setStep("setup");
      } else {
        setError("Failed to generate 2FA setup data");
      }
    } catch (_err) {
      setError("Failed to generate 2FA setup data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (response.error) {
        setError(response.error.message || "Invalid verification code");
      } else {
        setStep("backup");
        toast.success("2FA enabled successfully!");
      }
    } catch (_err) {
      setError("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (_err) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = `Zolai AI - Backup Codes
Generated: ${new Date().toLocaleDateString()}

Important: Store these codes in a safe place. Each code can only be used once.

${setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

These codes can be used to access your account if you lose your authenticator device.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zolai-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setBackupCodesDownloaded(true);
    toast.success("Backup codes downloaded successfully");
  };

  const handleComplete = () => {
    setStep("complete");
    onComplete?.();
  };

  if (error && !setupData && step !== "confirm") {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Confirm Password Step */}
      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Your Password</CardTitle>
            <CardDescription>
              Enter your account password to begin two-factor setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordInput
              id="two-factor-password"
              name="two-factor-password"
              label="Account Password"
              placeholder="Enter your password"
              value={password}
              onChange={(nextValue) => {
                setPassword(nextValue);
                setError(null);
              }}
              disabled={isLoading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={generateSetup}
                disabled={isLoading || !password.trim()}
                className="flex-1"
              >
                {isLoading ? "Setting up 2FA..." : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Step */}
      {step === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">1</span>
              Setup Authenticator App
            </CardTitle>
            <CardDescription>
              Scan the QR code with Google Authenticator, Authy, or any compatible app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupData && (
              <>
                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value={setupData.qrCode} size={200} />
                </div>
                
                {/* Manual entry option */}
                <Separator />
                <div>
                  <Label className="text-sm font-medium">
                    Can&apos;t scan? Enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 p-2 text-sm bg-muted rounded font-mono break-all">
                      {setupData.secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(setupData.secret, "Secret key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={() => setStep("verify")} className="w-full">
                  Continue
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verify Step */}
      {step === "verify" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</span>
              Verify Setup
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError(null);
                }}
                className={cn(
                  "text-center text-2xl tracking-widest",
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("setup")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes Step */}
      {step === "backup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">3</span>
              Save Backup Codes
            </CardTitle>
            <CardDescription>
              Store these codes safely. You can use them to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Each backup code can only be used once. Store them in a secure location.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {setupData?.backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono p-1">
                  {index + 1}. {code}
                </code>
              ))}
            </div>

            <Button
              onClick={downloadBackupCodes}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Backup Codes
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("verify")}
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!backupCodesDownloaded}
                className="flex-1"
              >
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">2FA Enabled Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your account is now protected with two-factor authentication.
            </p>
            <Button onClick={onComplete} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel button (only show in setup/verify steps) */}
      {(step === "setup" || step === "verify") && onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          Cancel Setup
        </Button>
      )}
    </div>
  );
}