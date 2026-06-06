"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const lightColors = {
  // Success toast - green
  "--success-bg": "#ecfdf5",
  "--success-border": "#10b981",
  "--success-text": "#065f46",
  // Error toast - red
  "--error-bg": "#fef2f2",
  "--error-border": "#ef4444",
  "--error-text": "#991b1b",
  // Warning toast - amber
  "--warning-bg": "#fffbeb",
  "--warning-border": "#f59e0b",
  "--warning-text": "#92400e",
  // Info toast - blue
  "--info-bg": "#eff6ff",
  "--info-border": "#3b82f6",
  "--info-text": "#1e40af",
};

const darkColors = {
  // Success toast - green (dark mode)
  "--success-bg": "#052e16",
  "--success-border": "#22c55e",
  "--success-text": "#bbf7d0",
  // Error toast - red (dark mode)
  "--error-bg": "#450a0a",
  "--error-border": "#f87171",
  "--error-text": "#fecaca",
  // Warning toast - amber (dark mode)
  "--warning-bg": "#451a03",
  "--warning-border": "#fbbf24",
  "--warning-text": "#fef3c7",
  // Info toast - blue (dark mode)
  "--info-bg": "#1e3a5f",
  "--info-border": "#60a5fa",
  "--info-text": "#bfdbfe",
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          ...colors,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          success:
            "!bg-[--success-bg] !border-[--success-border] !text-[--success-text]",
          error:
            "!bg-[--error-bg] !border-[--error-border] !text-[--error-text]",
          warning:
            "!bg-[--warning-bg] !border-[--warning-border] !text-[--warning-text]",
          info: "!bg-[--info-bg] !border-[--info-border] !text-[--info-text]",
        },
      }}
      {...props}
      duration={4000}
      position="bottom-right"
    />
  );
};

export { Toaster };
