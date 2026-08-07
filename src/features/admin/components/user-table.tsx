"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/features/admin/components/search-bar";
import { FilterPanel } from "@/features/admin/components/filter-panel";
import { setUserActiveAction } from "@/features/admin/actions/admin-actions";
import { assignRoleAction } from "@/features/auth/actions/auth-actions";
import {
  adminAssignableRoles,
  type AssignRoleInput,
} from "@/validations/auth";
import { ROLE_LABELS, type UserRole } from "@/constants/roles";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";

export interface UserTableRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
  coins: number;
  recycledGrams: number;
}

interface UserTableProps {
  users: UserTableRow[];
  currentUserId: string;
}

const ROLE_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "USER", label: "Users" },
  { id: "COLLECTOR", label: "Collectors" },
  { id: "RECYCLER", label: "Recyclers" },
  { id: "SELLER", label: "Sellers" },
];

export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = role === "ALL" || u.role === role;
      const hay = `${u.name ?? ""} ${u.email}`.toLowerCase();
      const matchesQ = !q || hay.includes(q.toLowerCase());
      return matchesRole && matchesQ;
    });
  }, [users, q, role]);

  function changeRole(userId: string, next: AssignRoleInput["role"]) {
    startTransition(async () => {
      const result = await assignRoleAction({ userId, role: next });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function toggleActive(userId: string, isActive: boolean) {
    startTransition(async () => {
      const result = await setUserActiveAction({ userId, isActive });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Users</CardTitle>
        <p className="text-sm text-muted-foreground">
          Search, filter by role, assign Collector/Recycler, and suspend accounts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={q} onChange={setQ} placeholder="Search users…" />
          <FilterPanel options={ROLE_FILTERS} value={role} onChange={setRole} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Coins</th>
                <th className="px-4 py-3">Recycled</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const locked =
                  user.id === currentUserId ||
                  user.role === "ADMIN" ||
                  user.role === "SUPER_ADMIN";
                const selectable = (
                  adminAssignableRoles as readonly string[]
                ).includes(user.role);

                return (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">
                        {user.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {locked || !selectable ? (
                        <Badge variant="secondary">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      ) : (
                        <select
                          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                          defaultValue={user.role}
                          disabled={pending}
                          onChange={(e) =>
                            changeRole(
                              user.id,
                              e.target.value as AssignRoleInput["role"],
                            )
                          }
                        >
                          {adminAssignableRoles.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold coin-text">
                      {formatCoin(user.coins)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatWeight(user.recycledGrams)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? "secondary" : "destructive"}>
                        {user.isActive ? "active" : "suspended"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatRelative(
                        typeof user.createdAt === "string"
                          ? new Date(user.createdAt)
                          : user.createdAt,
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!locked ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => toggleActive(user.id, !user.isActive)}
                        >
                          {user.isActive ? "Suspend" : "Activate"}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No users match.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
