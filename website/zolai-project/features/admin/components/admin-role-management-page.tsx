"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Users,
  Activity,
  UserCog,
  Loader2,
  Mail,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  type UpdateUserRoleRequest,
} from "@/features/admin/hooks/use-role-management";
import { client } from "@/lib/api/client";

type AdminUser = { id: string; name: string; email: string; role: string; banned?: boolean | null; emailVerified: boolean; createdAt: string };
import {
  useBulkUpdateUserRoles,
  useRoleMetrics,
  useUpdateUserRole,
} from "@/features/admin/hooks/use-role-management";
import { useTablePagination } from "@/features/settings/hooks/use-table-pagination";

import { ALL_ROLES, ROLES } from "@/lib/auth/roles";

const ROLE_OPTIONS = ALL_ROLES;
type RoleOption = (typeof ROLE_OPTIONS)[number];

interface RoleEditState {
  open: boolean;
  user: AdminUser | null;
  role: RoleOption;
  reason: string;
}

export function AdminRoleManagementPage() {
  const { isLoading: isPrefsLoading } = useTablePagination();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<RoleOption>("contributor");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [roleEdit, setRoleEdit] = useState<RoleEditState>({
    open: false,
    user: null,
    role: "contributor",
    reason: "",
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users-role-management", search],
    queryFn: async () => {
      const q: Record<string, string> = { page: "1", limit: "200" };
      if (search) q.search = search;
      const res = await client.api.admin.users.$get({ query: q });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: !isPrefsLoading,
  });

  const metricsQuery = useRoleMetrics();
  const updateUserRoleMutation = useUpdateUserRole();
  const bulkUpdateMutation = useBulkUpdateUserRoles();

  const users = (usersQuery.data as unknown as { success: boolean; data: { id: string; name: string; email: string; emailVerified: boolean; createdAt: string; role: string; banned: boolean | null }[] } | undefined)?.data ?? [];
  const metricsData = metricsQuery.data?.data;
  const roleDistribution = useMemo(
    () => metricsData?.roleDistribution ?? {},
    [metricsData],
  );
  const recentChanges = metricsData?.recentRoleChanges ?? [];
  const roleChangesLast30Days = metricsData?.roleChangesLast30Days ?? 0;

  const allSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));
  const selectedCount = selectedIds.size;

  const roleCards = useMemo(() => {
    return ROLE_OPTIONS.map((role) => ({
      role,
      count: roleDistribution[role] ?? 0,
    }));
  }, [roleDistribution]);

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(users.map((user) => user.id)));
      return;
    }
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openRoleEdit(user: AdminUser) {
    const userRole = ROLE_OPTIONS.includes(user.role as RoleOption)
      ? (user.role as RoleOption)
      : "contributor";
    setRoleEdit({ open: true, user, role: userRole, reason: "" });
  }

  async function submitRoleEdit() {
    if (!roleEdit.user) return;
    const payload: UpdateUserRoleRequest = {
      userId: roleEdit.user.id,
      role: roleEdit.role,
      reason: roleEdit.reason.trim() || undefined,
    };
    await updateUserRoleMutation.mutateAsync(payload);
    setRoleEdit({ open: false, user: null, role: "contributor", reason: "" });
  }

  async function submitBulkUpdate() {
    if (selectedIds.size === 0) return;
    await bulkUpdateMutation.mutateAsync({
      userIds: Array.from(selectedIds),
      role: bulkRole,
      reason: bulkReason.trim() || undefined,
    });
    setBulkOpen(false);
    setBulkReason("");
    setSelectedIds(new Set());
  }

  const isLoading = isPrefsLoading || usersQuery.isLoading || metricsQuery.isLoading;
  const isMutating = updateUserRoleMutation.isPending || bulkUpdateMutation.isPending;

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage roles, monitor role metrics, and track recent permission changes.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-72"
          />
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button disabled={selectedCount === 0 || isMutating}>
                <Users className="mr-2 h-4 w-4" />
                Bulk Update ({selectedCount})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Roles</DialogTitle>
                <DialogDescription>
                  Apply a single role to all selected users.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="bulk-role">Role</Label>
                  <Select value={bulkRole} onValueChange={(value) => setBulkRole(value as RoleOption)}>
                    <SelectTrigger id="bulk-role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-reason">Reason (optional)</Label>
                  <Textarea
                    id="bulk-reason"
                    placeholder="Why are you changing these roles?"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    maxLength={500}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitBulkUpdate} disabled={isMutating || selectedCount === 0}>
                  {bulkUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Apply Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role Changes (30d)</CardTitle>
            <CardDescription>Recent role update activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleChangesLast30Days}</div>
            <div className="mt-1 text-xs text-muted-foreground">Tracked through audit logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <CardDescription>Users in current listing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Search filtered view</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected Users</CardTitle>
            <CardDescription>Ready for bulk changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{selectedCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">Use bulk update to apply one role</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Role Distribution
          </CardTitle>
          <CardDescription>Current users grouped by assigned role</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {roleCards.map((item) => (
                <div key={item.role} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{item.role}</div>
                  <div className="mt-1 text-2xl font-semibold">{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCog className="h-5 w-5" />
            User Roles
          </CardTitle>
          <CardDescription>Change roles per user or with bulk actions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={allSelected} onCheckedChange={(value) => toggleSelectAll(value === true)} />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium">{user.name || "Unknown"}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN ? "default" : "secondary"}>
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.emailVerified ? "default" : "outline"}>
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">
                            <Ban className="mr-1 h-3 w-3" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleEdit(user)}
                          disabled={isMutating}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No users found for this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Role Change Activity</CardTitle>
          <CardDescription>Last 10 role updates from audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : recentChanges.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">No recent role changes found.</div>
          ) : (
            <div className="space-y-3">
              {recentChanges.map((change) => (
                <div key={change.id} className="flex flex-col justify-between gap-2 rounded-md border p-3 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{change.userId}: {change.oldRole} → {change.newRole}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(change.changedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={roleEdit.open}
        onOpenChange={(open) =>
          setRoleEdit((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              {roleEdit.user
                ? `Change role for ${roleEdit.user.name || roleEdit.user.email}`
                : "Select a user to change role"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="single-role">Role</Label>
              <Select
                value={roleEdit.role}
                onValueChange={(value) =>
                  setRoleEdit((prev) => ({
                    ...prev,
                    role: value as RoleOption,
                  }))
                }
              >
                <SelectTrigger id="single-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="single-reason">Reason (optional)</Label>
              <Textarea
                id="single-reason"
                placeholder="Provide a reason for this role update"
                value={roleEdit.reason}
                onChange={(e) =>
                  setRoleEdit((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRoleEdit({
                  open: false,
                  user: null,
                  role: "contributor",
                  reason: "",
                })
              }
            >
              Cancel
            </Button>
            <Button onClick={submitRoleEdit} disabled={!roleEdit.user || isMutating}>
              {updateUserRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
