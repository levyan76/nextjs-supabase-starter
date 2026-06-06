"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./header";
import { useLocale } from "next-intl";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function DashboardLayout({
  children,
  breadcrumbs,
  className,
}: DashboardLayoutProps) {
  const locale = useLocale();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  // Set dayjs locale based on the current locale
  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);
  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader
        isOpen={isLeftSidebarOpen}
        breadcrumbs={breadcrumbs}
        onToggleNotifications={() => {}}
        onToggleSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="relative flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isLeftSidebarOpen}
          onClose={() => setIsLeftSidebarOpen(false)}
        />
        {/* Content */}
        <main
          className={cn(
            "flex flex-1 flex-col overflow-y-auto p-4 md:p-6",
            className
          )}
        >
          {children}
        </main>

        {/* Overlay for Left Sidebar on Mobile */}
        {isLeftSidebarOpen && (
          <div
            className="bg-background/20 absolute inset-0 z-40 backdrop-blur-sm transition-all duration-300 lg:hidden"
            onClick={() => setIsLeftSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
