import AdminSettingsForm from "@/features/settings/components/admin/admin-settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure site settings and preferences
        </p>
      </div>
      <AdminSettingsForm />
    </div>
  );
}
