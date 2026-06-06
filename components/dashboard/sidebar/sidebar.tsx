"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import { SidebarSection } from "./sidebar-section";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useAuthUser } from "@/hooks";
import { UserProfileMenu } from "../header/UserProfileMenu";
import { APP_NAME } from "@/lib/config/company-profile";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const { user } = useAuthUser();
  const role = user?.role;
  const t = useTranslations("Navigation");

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col shadow-xl transition-all duration-300 ease-in-out lg:static lg:h-[calc(100vh-64px)] lg:shadow-none",
        isOpen
          ? "w-56 translate-x-0 border-r"
          : "w-56 -translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-none",
        className
      )}
    >
      {/* Logo — mobile uniquement */}
      <div className="border-sidebar-border flex h-16 items-center gap-2 border-b px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt={APP_NAME}
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {/* Accueil — tous les rôles */}
        <SidebarSection title={t("overview")}>
          <SidebarNavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label={t("dashboard")}
          />
        </SidebarSection>

        {/* ── Ajouter ici les sections métier de l'app dérivée ── */}

        {/* Administration — ADMIN seulement */}
        {role === "ADMIN" && (
          <SidebarSection title={t("administration")}>
            <SidebarNavItem
              href="/admin/users"
              icon={Users}
              label={t("users")}
            />
            <SidebarNavItem
              href="/admin/settings"
              icon={Settings}
              label={t("settings")}
            />
          </SidebarSection>
        )}
      </nav>

      {/* Menu utilisateur en bas */}
      <div className="border-sidebar-border border-t p-2">
        <UserProfileMenu variant="sidebar" />
      </div>
    </aside>
  );
}
