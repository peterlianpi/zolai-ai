"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Key, 
  Smartphone, 
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { TOTPSetup } from "./totp-setup";
import { PasswordInput } from "./password-input";

export function TwoFactorSettings() {
  const { data: session, refetch } = useSession();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  // Check 2FA status on component mount
  useEffect(() => {
    if (session?.user?.twoFactorEnabled) {
      setIsEnabled(true);
    }
  }, [session]);

  const handleEnable2FA = () => {
    setShowSetup(true);
  };

  const handleSetupComplete = async () => {
    setShowSetup(false);
    setIsEnabled(true);
    toast.success("Two-factor authentication enabled successfully!");
    
    // Refresh session to get updated 2FA status
    await refetch();
  };

  const handleDisable2FA = async () => {
    if (!disablePassword.trim()) {
      toast.error("Please enter your account password");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authClient.twoFactor.disable({
        password: disablePassword,
      });
      
      if (response?.error) {
        toast.error(response.error.message || "Failed to disable 2FA");
      } else {
        setIsEnabled(false);
        setShowDisableConfirm(false);
        setDisablePassword("");
        toast.success("Two-factor authentication disabled");
        
        // Refresh session
        await refetch();
      }
    } catch (err) {
      toast.error("Failed to disable 2FA");
      console.error("Disable 2FA error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBackupCodes = async () => {
    setIsLoading(true);
    
    try {
      // Note: This would need to be implemented as a server action
      // since Better Auth doesn't expose viewBackupCodes on client
      toast.info("Viewing backup codes requires password verification - feature coming soon");
    } catch (err) {
      toast.error("Failed to view backup codes");
      console.error("View backup codes error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    
    try {
      const response = await authClient.twoFactor.generateBackupCodes({});
      
      if (response?.error) {
        toast.error(response.error.message || "Failed to generate backup codes");
      } else if (response?.data?.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
        toast.success("New backup codes generated");
      }
    } catch (err) {
      toast.error("Failed to generate backup codes");
      console.error("Generate backup codes error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!backupCodes) return;

    const content = `Zolai AI - Backup Codes
Generated: ${new Date().toLocaleDateString()}

Important: Store these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

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
    
    toast.success("Backup codes downloaded");
  };

  if (showSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Secure your account with an additional layer of protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TOTPSetup 
            onComplete={handleSetupComplete}
            onCancel={() => setShowSetup(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium">2FA Enabled</div>
                    <div className="text-sm text-muted-foreground">
                      Your account is protected with two-factor authentication
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <ShieldX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium">2FA Disabled</div>
                    <div className="text-sm text-muted-foreground">
                      Enable 2FA to secure your account
                    </div>
                  </div>
                </>
              )}
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>

          {!isEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> Enable two-factor authentication to protect your account from unauthorized access.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {isEnabled ? (
              <Button
                variant="destructive"
                onClick={() => setShowDisableConfirm(true)}
                disabled={isLoading}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={handleEnable2FA}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Codes Management */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Download and store backup codes in case you lose access to your authenticator device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Backup codes are single-use codes that can be used to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleViewBackupCodes}
                disabled={isLoading}
              >
                View Codes
              </Button>
              <Button
                variant="outline"
                onClick={handleRegenerateBackupCodes}
                disabled={isLoading}
              >
                Generate New Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Methods Card */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Authentication Methods
            </CardTitle>
            <CardDescription>
              Manage your two-factor authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-sm text-muted-foreground">
                    Google Authenticator, Authy, or compatible apps
                  </div>
                </div>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disable Confirmation Dialog */}
      <Dialog
        open={showDisableConfirm}
        onOpenChange={(open) => {
          setShowDisableConfirm(open);
          if (!open) setDisablePassword("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable two-factor authentication? This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PasswordInput
              id="disable-2fa-password"
              name="disable-2fa-password"
              label="Account Password"
              placeholder="Enter your password"
              value={disablePassword}
              onChange={setDisablePassword}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDisableConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isLoading || !disablePassword.trim()}
              className="flex-1"
            >
              {isLoading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Display Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Your Backup Codes</DialogTitle>
            <DialogDescription>
              Store these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> These codes replace your previous backup codes. Make sure to download them.
            </AlertDescription>
          </Alert>

          {backupCodes && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono p-1">
                  {index + 1}. {code}
                </code>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBackupCodes(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button onClick={downloadBackupCodes} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}