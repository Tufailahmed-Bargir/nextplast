"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/features/admin/components/search-bar";
import { FilterPanel } from "@/features/admin/components/filter-panel";
import { setUserActiveAction } from "@/features/admin/actions/admin-actions";
import { assignRoleAction } from "@/features/auth/actions/auth-actions";
import { adminAssignableRoles, type AssignRoleInput } from "@/validations/auth";
import { ROLE_LABELS, type UserRole } from "@/constants/roles";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { usePendingAction } from "@/hooks/use-pending-action";

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
  const { pending, run, isRunning } = usePendingAction();
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
    run(`role:${userId}`, async () => {
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
    run(`active:${userId}`, async () => {
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
        <p className="text-muted-foreground text-sm">
          Search, filter by role, assign Collector/Recycler, and suspend
          accounts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={q} onChange={setQ} placeholder="Search users…" />
          <FilterPanel options={ROLE_FILTERS} value={role} onChange={setRole} />
        </div>

        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-border bg-muted/40 text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
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
                    className="border-border hover:bg-muted/30 border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">
                        {user.name || "Unnamed"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {locked || !selectable ? (
                        <Badge variant="secondary">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="border-input h-9 rounded-lg border bg-transparent px-2 text-sm"
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
                          {isRunning(`role:${user.id}`) ? (
                            <Loader2
                              className="text-muted-foreground h-4 w-4 animate-spin"
                              aria-label="Saving"
                            />
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="coin-text px-4 py-3 text-sm font-semibold">
                      {formatCoin(user.coins)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {formatWeight(user.recycledGrams)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.isActive ? "secondary" : "destructive"}
                      >
                        {user.isActive ? "active" : "suspended"}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
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
                          loading={isRunning(`active:${user.id}`)}
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
            <p className="text-muted-foreground p-4 text-sm">No users match.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
