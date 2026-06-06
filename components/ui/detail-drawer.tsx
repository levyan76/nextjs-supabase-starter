"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: React.ReactNode;
  /** "inline" = grid-based side panel, "overlay" = shadcn Drawer sliding from right */
  mode?: "inline" | "overlay";
  /** Width class for overlay mode (default: "sm:max-w-md") */
  width?: string;
  children: React.ReactNode;
  /** Optional header actions (e.g. edit/delete buttons) */
  headerActions?: React.ReactNode;
}

/**
 * DetailDrawer — a reusable right-side detail panel.
 *
 * - `mode="inline"`:  renders as a sticky card inside a CSS grid (caller manages grid cols).
 * - `mode="overlay"`: renders as a shadcn Drawer (Vaul) sliding from the right.
 */
export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  mode = "inline",
  width = "sm:max-w-md",
  children,
  headerActions,
}: DetailDrawerProps) {
  if (mode === "inline") {
    if (!open) return null;

    return (
      <div className="bg-card text-card-foreground animate-in slide-in-from-right-8 sticky top-6 col-span-1 h-fit rounded-lg border p-6 shadow-sm duration-300">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between border-b pb-4">
          <div className="min-w-0 flex-1">
            {title && <h2 className="truncate text-xl font-bold">{title}</h2>}
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {headerActions}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6">{children}</div>
      </div>
    );
  }

  // mode === "overlay" → shadcn Drawer from the right
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      direction="right"
    >
      <DrawerContent
        className={cn("inset-y-0 right-0 w-3/4 rounded-none", width)}
      >
        <DrawerHeader className="flex flex-row items-start justify-between border-b px-6 py-4">
          <div className="min-w-0 flex-1">
            {title && (
              <DrawerTitle className="truncate text-lg">{title}</DrawerTitle>
            )}
            {subtitle && (
              <DrawerDescription asChild>
                <div className="mt-0.5">{subtitle}</div>
              </DrawerDescription>
            )}
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {headerActions}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
