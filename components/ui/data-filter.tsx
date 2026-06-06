"use client";

import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  DatePicker,
} from "@/components/ui";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type FilterFieldType = "text" | "select" | "date" | "date-range";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DataFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, string | undefined>) => void;
  currentFilters: Record<string, string | undefined>;
  className?: string;
}

export function DataFilter({
  fields,
  onFilterChange,
  currentFilters,
  className = "",
}: DataFilterProps) {
  const t = useTranslations("Common.filter");

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {fields.map((field) => (
        <div
          key={field.key}
          className={cn("min-w-36 flex-1 md:flex-none", {
            "min-w-52": field.type === "date-range",
            "max-w-52": field.type !== "date-range",
          })}
        >
          {field.type === "text" && (
            <div className="relative">
              {field.icon ? (
                <div className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2">
                  {field.icon}
                </div>
              ) : (
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              )}
              <Input
                placeholder={field.placeholder || field.label || t("search")}
                value={currentFilters[field.key] || ""}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
                className={cn(
                  "h-9",
                  field.icon || field.type === "text" ? "pl-8" : "pl-3"
                )}
                disabled={field.disabled}
              />
            </div>
          )}

          {field.type === "select" && (
            <Select
              disabled={field.disabled}
              value={currentFilters[field.key] || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  field.key,
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="bg-background/50 hover:bg-background border-border/50 h-9 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                  {field.icon && (
                    <span className="text-muted-foreground shrink-0">
                      {field.icon}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                    {field.label}
                  </span>
                  <div className="truncate text-xs font-medium">
                    <SelectValue placeholder={field.placeholder || t("all")} />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "date" && (
            <div className="group relative">
              <DatePicker
                date={
                  currentFilters[field.key]
                    ? currentFilters[field.key]
                    : undefined
                }
                setDate={(_, dateIso) =>
                  handleFilterChange(field.key, dateIso || undefined)
                }
                placeholder={field.placeholder || field.label}
                className={cn(
                  "bg-background/50 border-border/50 hover:bg-background h-9 text-xs transition-colors",
                  field.icon && "pl-8"
                )}
              />
              {field.icon && (
                <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2">
                  {field.icon}
                </div>
              )}
            </div>
          )}

          {field.type === "date-range" && (
            <div className="bg-background/50 border-border/50 group flex h-9 items-center gap-1.5 overflow-hidden rounded-md border px-1.5">
              <div className="flex flex-1 items-center gap-1">
                <div className="flex flex-1 items-center gap-1">
                  <DatePicker
                    date={
                      currentFilters[`${field.key}_start`]
                        ? currentFilters[`${field.key}_start`]!
                        : undefined
                    }
                    setDate={(_, dateIso) =>
                      handleFilterChange(
                        `${field.key}_start`,
                        dateIso || undefined
                      )
                    }
                    placeholder={t("start")}
                    className="h-7 w-full justify-center border-none bg-transparent p-0 text-[10px] shadow-none hover:bg-transparent focus-visible:ring-0"
                  />
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 text-[10px] font-medium">
                →
              </span>
              <div className="flex flex-1 items-center gap-1">
                <DatePicker
                  date={
                    currentFilters[`${field.key}_end`]
                      ? currentFilters[`${field.key}_end`]!
                      : undefined
                  }
                  setDate={(_date, dateIso) =>
                    handleFilterChange(`${field.key}_end`, dateIso || undefined)
                  }
                  disabledPastDate={false}
                  placeholder={t("end")}
                  className="h-7 w-full justify-center border-none bg-transparent p-0 text-[10px] shadow-none hover:bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {Object.keys(currentFilters).some(
        (k) => currentFilters[k] !== undefined && currentFilters[k] !== ""
      ) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-destructive/60 h-9 rounded-full px-2"
          title={t("clear")}
        >
          <X className="size-3.5" />
          {/* <span className="text-xs">{t("reset")}</span> */}
        </Button>
      )}
    </div>
  );
}
