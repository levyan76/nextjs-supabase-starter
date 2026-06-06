"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  icon?: LucideIcon;
  label: string;
  isNested?: boolean;
  disabled?: boolean;
  badge?: string | number;
  activePrefixes?: string[];
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  isNested = false,
  disabled = false,
  badge,
  activePrefixes = [],
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    activePrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        disabled && "cursor-not-allowed opacity-60",
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isNested && "pl-9",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0",
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
          )}
        />
      )}
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span className="bg-sidebar-primary/10 text-sidebar-primary ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarNavItemCollapsibleProps {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarNavItemCollapsible({
  icon: Icon,
  label,
  children,
  defaultOpen = false,
}: SidebarNavItemCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        {Icon && (
          <Icon className="text-sidebar-foreground/50 size-4 shrink-0" />
        )}
        <span className="truncate">{label}</span>
        <ChevronRight
          className={cn(
            "text-sidebar-foreground/50 ml-auto size-4 shrink-0 transition-transform",
            isOpen && "rotate-90"
          )}
        />
      </button>
      {isOpen && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
}
