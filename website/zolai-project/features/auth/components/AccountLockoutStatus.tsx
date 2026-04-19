'use client';

import { useState } from 'react';
import { client } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface LockoutStatus {
  accountLocked: boolean;
  lockoutExpires?: Date;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Date;
  recentFailedAttempts: number;
}

export function AccountLockoutStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<LockoutStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await client.api.auth.lockout.status[':userId'].$get(
        {},
        { param: { userId } }
      );
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (reason?: string) => {
    try {
      const res = await client.api.auth.lockout.unlock[':userId'].$post(
        { json: { reason } },
        { param: { userId } }
      );
      if (!res.ok) throw new Error('Failed to unlock');
      toast.success('Account unlocked');
      await fetchStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlock');
    }
  };

  if (!status) {
    return (
      <Button onClick={fetchStatus} disabled={loading}>
        {loading ? 'Loading...' : 'Check Status'}
      </Button>
    );
  }

  const isLocked = status.accountLocked;
  const lockoutExpired = status.lockoutExpires && new Date(status.lockoutExpires) < new Date();

  return (
    <Card className={isLocked && !lockoutExpired ? 'border-red-300 bg-red-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isLocked && !lockoutExpired ? (
            <>
              <Lock className="h-5 w-5 text-red-600" />
              Account Locked
            </>
          ) : (
            <>
              <Unlock className="h-5 w-5 text-green-600" />
              Account Active
            </>
          )}
        </CardTitle>
        <CardDescription>Security lockout status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLocked && !lockoutExpired && (
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Account is locked due to too many failed login attempts.
              {status.lockoutExpires && (
                <div className="mt-2">
                  Unlocks at: {new Date(status.lockoutExpires).toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Failed Attempts (15 min):</span>
            <span className="font-semibold">{status.recentFailedAttempts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Failed Attempts:</span>
            <span className="font-semibold">{status.failedLoginAttempts}</span>
          </div>
          {status.lastFailedLoginAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Failed Attempt:</span>
              <span className="text-xs text-gray-500">
                {new Date(status.lastFailedLoginAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {isLocked && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="destructive">
                Unlock Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Unlock Account</AlertDialogTitle>
              <AlertDialogDescription>
                This will immediately unlock the account and reset failed login attempts.
              </AlertDialogDescription>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleUnlock('Admin unlock')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Unlock
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
