"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  Bell,
  RefreshCw,
  ChevronFirst,
  ChevronLast,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

import { LanguageSwitcher } from "./LanguageSwitcher";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/config/company-profile";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  isOpen?: boolean;
  className?: string;
  onToggleNotifications?: () => void;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({
  breadcrumbs = [],
  title,
  isOpen,
  className,
  onToggleNotifications,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const t = useTranslations("Header");
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header
      className={cn(
        "border-border bg-background flex h-16 items-center justify-between border-b pr-6",
        className
      )}
    >
      {/* Left side - Breadcrumbs */}
      <div className="flex items-center gap-2">
        {/* Logo */}
        <div
          className={cn("flex h-16 items-center gap-2 border-r px-4", {
            "hidden w-56 lg:flex": isOpen,
            "w-auto": !isOpen,
          })}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={140}
              height={40}
              className="h-10 w-auto rounded-xs border object-contain"
              priority
            />
          </Link>
          {isOpen && <h1 className="text-lg font-semibold">{APP_NAME}</h1>}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground mr-2"
          onClick={onToggleSidebar}
        >
          {isOpen ? (
            <ChevronFirst className="size-4" />
          ) : (
            <ChevronLast className="size-4" />
          )}
        </Button>

        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((item, index) => (
              <Fragment key={index}>
                {index > 0 && <span className="text-muted-foreground">/</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">
                    {item.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}

        {title && !breadcrumbs.length && (
          <h1 className="text-foreground text-lg font-semibold">{title}</h1>
        )}
      </div>

      {/* Right side - Search and actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {/* <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={t("search")}
            className="bg-muted/50 focus:border-input w-64 border-transparent pl-9"
          />
          <kbd className="bg-muted pointer-events-none absolute top-1/2 right-3 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
            /
          </kbd>
        </div> */}

        {/* Environment Indicator */}
        {process.env.NEXT_PUBLIC_APP_ENV === "dev" && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge variant="warning" className="cursor-pointer">
                {t("testMode")}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <PopoverHeader>
                <PopoverTitle className="flex items-center gap-2">
                  <span className="bg-warning flex h-2 w-2 rounded-full" />
                  {t("testModeTitle")}
                </PopoverTitle>
              </PopoverHeader>
              <div className="grid gap-4 pt-4">
                <p className="text-muted-foreground text-sm">
                  {t("testModeDescription")}
                </p>
                <Button asChild size="sm" className="w-full">
                  <a
                    href={process.env.NEXT_PUBLIC_PROD_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    {t("goToProduction")}
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground relative"
          onClick={onToggleNotifications}
        >
          <Bell className="size-4" />
        </Button>
        {/* {} */}

        <div className="bg-border mx-1 h-4 w-px" />

        <LanguageSwitcher />
      </div>
    </header>
  );
}
