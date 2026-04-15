"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { changePassword } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Lock, Key, LogOut, Loader2, Save } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { PasswordInput } from "@/features/auth/components/password-input";

export function AdminProfilePage() {
  const { data: session, refetch } = useSession();
  const user = session?.user;
  const role = (user as { role?: string })?.role || "USER";

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await client.api.profile.$patch({
        json: data,
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated");
      refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords don't match");
      if (newPassword.length < 8) throw new Error("Minimum 8 characters");
      
      // Use Better Auth's built-in changePassword function
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to change password");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saving = updateProfile.isPending || changePasswordMutation.isPending;

  const cards = [
    {
      title: "Profile Information", icon: User, desc: "Update your personal information",
      content: (
        <>
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" /></div>
          <div className="grid gap-2"><Label>Role</Label><Badge variant="secondary">{role}</Badge></div>
          <Button onClick={() => updateProfile.mutate({ name, email })} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Changes</Button>
        </>
      ),
    },
    {
      title: "Change Password", icon: Lock, desc: "Update your password",
      content: (
        <>
          <PasswordInput id="currentPassword" name="currentPassword" label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" />
          <PasswordInput id="newPassword" name="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
          <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
           <Button onClick={() => changePasswordMutation.mutate()} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}Change Password</Button>
        </>
      ),
    },
    {
      title: "Account Security", icon: Shield, desc: "Manage your account security settings",
      content: (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Email Verified</Label><p className="text-sm text-muted-foreground">{user?.emailVerified ? "Your email is verified" : "Your email is not verified"}</p></div>
            <Badge variant={user?.emailVerified ? "default" : "destructive"}>{user?.emailVerified ? "Verified" : "Not Verified"}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Two-Factor Authentication</Label><p className="text-sm text-muted-foreground">Add an extra layer of security</p></div>
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </div>
        </>
      ),
    },
    {
      title: "Danger Zone", icon: LogOut, desc: "Irreversible actions for your account", destructive: true,
      content: (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5"><Label>Delete Account</Label><p className="text-sm text-muted-foreground">Permanently delete your account and all data</p></div>
          <Button variant="destructive">Delete Account</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div><h2 className="text-2xl font-bold tracking-tight">Profile</h2><p className="text-muted-foreground">Manage your account settings</p></div>
      <div className="grid gap-6">
        {cards.map((card, i) => (
          <Card key={i} className={card.destructive ? "border-destructive" : ""}>
            <CardHeader><CardTitle className={`flex items-center gap-2 ${card.destructive ? "text-destructive" : ""}`}><card.icon className="h-5 w-5" />{card.title}</CardTitle><CardDescription>{card.desc}</CardDescription></CardHeader>
            <CardContent className="space-y-4">{card.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}