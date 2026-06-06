"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  RotateCcw,
  Shield,
  User,
  Trash2,
  KeyRound,
} from "lucide-react";
import {
  fetchUsers,
  softDeleteUser,
  restoreUser,
  resetUserPassword,
} from "./actions";
import { UserForm } from "./user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "USER" | "ADMIN";
  active: boolean;
  deleted_at: string | null;
};

export function UsersList() {
  const t = useTranslations("Admin.Users");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{
    userId: string;
    password: string;
  } | null>(null);
  const pageSize = 10;

  const queryKey = ["users", "list", { page, pageSize, search, showDeleted }];

  const { data, isFetching: loading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchUsers({ page, pageSize, search: search || undefined, showDeleted }),
    staleTime: 30_000, // 30s — évite les rechargements inutiles
    placeholderData: (prev) => prev, // garde les données précédentes pendant le chargement
  });

  const users = (data?.users ?? []) as UserRow[];
  const totalCount = data?.totalCount ?? 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const handleDelete = async (userId: string) => {
    setActionLoading(userId + "_delete");
    try {
      await softDeleteUser(userId);
      await invalidate();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (userId: string) => {
    setActionLoading(userId + "_restore");
    try {
      await restoreUser(userId);
      await invalidate();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async (userId: string) => {
    setActionLoading(userId + "_reset");
    try {
      const result = await resetUserPassword(userId);
      setResetResult({ userId, password: result.newPassword });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowDeleted(!showDeleted);
            setPage(1);
          }}
        >
          {showDeleted ? t("hideDeleted") : t("showDeleted")}
        </Button>
      </div>

      {/* Reset password result */}
      {resetResult && (
        <div className="bg-warning/10 border-warning/30 text-warning-foreground space-y-1 rounded-lg border p-4 text-sm">
          <p className="font-medium">{t("generatedPasswordLabel")}</p>
          <code className="bg-warning/20 rounded px-2 py-1 font-mono text-sm">
            {resetResult.password}
          </code>
          <p className="text-muted-foreground text-xs">
            {t("passwordWarning")}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setResetResult(null)}
            className="mt-2"
          >
            {t("actions.cancel")}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                {t("fields.firstName")} / {t("fields.lastName")}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                {t("fields.email")}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                {t("fields.role")}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Statut
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="text-muted-foreground mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {t("noUsersFound")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={
                    user.deleted_at
                      ? "opacity-50"
                      : "hover:bg-muted/30 transition-colors"
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-medium">
                        {(
                          (user.first_name?.[0] ?? "") +
                          (user.last_name?.[0] ?? "")
                        ).toUpperCase() || "?"}
                      </div>
                      <span className="font-medium">
                        {[user.first_name, user.last_name]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {user.role === "ADMIN" ? (
                        <Shield className="size-3" />
                      ) : (
                        <User className="size-3" />
                      )}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.deleted_at ? (
                      <Badge variant="destructive">{t("deleted")}</Badge>
                    ) : (
                      <Badge variant={user.active ? "success" : "secondary"}>
                        {user.active ? "Actif" : "Inactif"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!user.deleted_at && (
                        <>
                          <UserForm
                            mode="edit"
                            user={user}
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <span className="sr-only">
                                  {t("actions.edit")}
                                </span>
                                ✏️
                              </Button>
                            }
                            onSuccess={invalidate}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleReset(user.id)}
                            disabled={actionLoading === user.id + "_reset"}
                          >
                            {actionLoading === user.id + "_reset" ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <KeyRound className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id + "_delete"}
                          >
                            {actionLoading === user.id + "_delete" ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {user.deleted_at && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRestore(user.id)}
                          disabled={actionLoading === user.id + "_restore"}
                        >
                          {actionLoading === user.id + "_restore" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RotateCcw className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{totalCount} utilisateurs</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="flex items-center px-2">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
