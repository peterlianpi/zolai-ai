"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MoreHorizontal, Mail, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { client } from "@/lib/api/client";

import { ALL_ROLES, isSuperAdmin } from "@/lib/auth/roles";

const ROLES_LIST = ALL_ROLES;

interface User { id: string; name: string; email: string; role: string; banned: boolean | null; emailVerified: boolean; createdAt: string }

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: session } = useQuery({ queryKey: ["session"], queryFn: async () => {
    const res = await client.api.health.$get();
    return res.json();
  }});
  const isCurrentUserSuperAdmin = isSuperAdmin((session as { data?: { user?: { role?: string } } })?.data?.user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page, roleFilter],
    queryFn: async () => {
      const res = await client.api.admin.users.$get({
        query: { page: String(page), limit: "20", ...(search && { search }), ...(roleFilter !== "all" && { role: roleFilter }) },
      });
      return res.json();
    },
  });

  const users: User[] = (data as { data?: User[] })?.data ?? [];
  const meta = (data as { meta?: { total: number; totalPages: number } })?.meta;

  async function action(userId: string, op: "ban" | "unban" | "delete" | "role", body?: unknown) {
    try {
      const res = op === "ban"    ? await client.api.admin.users[":id"].ban.$post({ param: { id: userId } })
                : op === "unban"  ? await client.api.admin.users[":id"].unban.$post({ param: { id: userId } })
                : op === "delete" ? await client.api.admin.users[":id"].$delete({ param: { id: userId } })
                :                   await client.api.admin.users[":id"].role.$patch({ param: { id: userId }, json: body as { role: string } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Done");
    } catch { toast.error("Action failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{meta?.total ?? 0} total users</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-56 h-9" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            ) : users.map(u => (
              <TableRow key={u.id} className={u.banned ? "opacity-50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
                      {u.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select defaultValue={u.role} onValueChange={v => action(u.id, "role", { role: v })} disabled={!isCurrentUserSuperAdmin}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES_LIST.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {u.banned
                      ? <Badge variant="destructive" className="text-xs">Banned</Badge>
                      : <Badge variant="secondary" className="text-xs">Active</Badge>
                    }
                    {u.emailVerified
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    }
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.banned
                        ? <DropdownMenuItem onClick={() => action(u.id, "unban")}>Unban</DropdownMenuItem>
                        : <DropdownMenuItem onClick={() => action(u.id, "ban")} className="text-orange-600">Ban</DropdownMenuItem>
                      }
                      {isCurrentUserSuperAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { if (confirm(`Delete ${u.name}?`)) action(u.id, "delete"); }} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{users.length} of {meta.total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm self-center">Page {page} of {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
