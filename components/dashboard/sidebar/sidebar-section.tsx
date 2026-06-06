"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  children,
  className,
}: SidebarSectionProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h3 className="text-sidebar-foreground/50 mb-2 px-3 text-xs font-medium tracking-wider uppercase">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
