'use client';

import { useDevices } from '@/features/auth/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Smartphone, MapPin, Clock, LogOut } from 'lucide-react';

export function DeviceManagement() {
  const { devices, loading, revokeDevice, revokeAllOthers } = useDevices();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Devices</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const currentDevice = devices.find(d => d.isCurrentSession);
  const otherDevices = devices.filter(d => !d.isCurrentSession);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Devices</CardTitle>
          <CardDescription>Manage your logged-in devices and sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentDevice && (
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-semibold">{currentDevice.deviceName || 'Unknown Device'}</span>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Current</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {currentDevice.country && currentDevice.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {currentDevice.city}, {currentDevice.country}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">{currentDevice.ipAddress}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {otherDevices.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Other Devices</h3>
              {otherDevices.map(device => (
                <div key={device.id} className="rounded-lg border p-4 flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">{device.deviceName || 'Unknown Device'}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {device.country && device.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {device.city}, {device.country}
                        </div>
                      )}
                      {device.lastActivityAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Last active: {new Date(device.lastActivityAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">{device.ipAddress}</div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Revoke Device</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign out this device. You can sign back in anytime.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeDevice(device.id, 'User revoked device')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Revoke
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}

          {otherDevices.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  Sign Out All Other Devices
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Sign Out All Other Devices</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign out all devices except this one. You can sign back in anytime.
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={revokeAllOthers}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sign Out All
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active devices found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
