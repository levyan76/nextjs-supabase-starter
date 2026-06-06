"use client";

import { useTranslations } from "next-intl";
import { useAuthUser } from "@/hooks";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { formatDate } from "@/lib/utils";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">{t("saving")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Avatar + nom */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full text-2xl font-semibold">
              {user?.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2) ?? "?"}
            </div>
            <div>
              <p className="text-xl font-semibold">{user?.fullName}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-card divide-y rounded-xl border">
          <div className="flex items-center gap-4 p-4">
            <User className="text-muted-foreground size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("firstName")}
              </p>
              <p className="font-medium">{user?.firstName ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <User className="text-muted-foreground size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("lastName")}
              </p>
              <p className="font-medium">{user?.lastName ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <Mail className="text-muted-foreground size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("email")}
              </p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <Shield className="text-muted-foreground size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("role")}
              </p>
              <p className="font-medium">{user?.role ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <Calendar className="text-muted-foreground size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {t("memberSince")}
              </p>
              <p className="font-medium">
                {user?.id ? formatDate(new Date().toISOString()) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Ajouter ici un formulaire d'édition du profil propre à l'app dérivée */}
      </div>
    </DashboardLayout>
  );
}
