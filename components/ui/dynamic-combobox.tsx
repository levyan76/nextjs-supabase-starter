"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DynamicOption {
  value: string;
  label: string;
}

interface DynamicComboboxProps {
  options: (string | DynamicOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
  showOtherOption?: boolean;
}

export function DynamicCombobox({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  emptyText = "Aucune option trouvée.",
  allowCustom = true,
  className,
  disabled = false,
  showOtherOption = false,
}: DynamicComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
  );

  const displayOptions = showOtherOption
    ? [
        ...filteredOptions.map((o) => ({ ...o, isOther: false })),
        { value: "Autre...", label: "Autre...", isOther: true },
      ]
    : filteredOptions.map((o) => ({ ...o, isOther: false }));

  const handleSelect = (val: string) => {
    if (val === "Autre...") {
      onChange(""); // Clear to allow custom input or trigger parent flow
      setSearch("");
    } else {
      // If clicking the same value, deselect it (if it's already the value)
      // Actually, standard behavior is usually click to select.
      // But we want to allow "None".
      onChange(val === value ? "" : val);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const selectedOption = normalizedOptions.find((o) => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : value || search;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-9 w-full justify-between font-normal", className)}
          disabled={disabled}
        >
          {value ? (
            <span className="flex-1 truncate text-left">{displayValue}</span>
          ) : (
            <span className="flex-1 truncate text-left opacity-60">
              {placeholder}
            </span>
          )}
          <div className="flex items-center">
            {value && (
              <div
                role="button"
                className="hover:bg-muted mr-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-50 transition-colors hover:opacity-100"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) overflow-hidden p-0"
        align="start"
      >
        <div className="flex flex-col">
          <div className="bg-popover sticky top-0 border-b p-2">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              autoFocus
            />
          </div>
          <div
            className="max-h-72 touch-pan-y overflow-y-auto overscroll-contain p-1"
            onWheel={(e) => e.stopPropagation()}
          >
            {displayOptions.length === 0 && !allowCustom && (
              <p className="text-muted-foreground p-2 text-center text-sm">
                {emptyText}
              </p>
            )}
            {displayOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground relative line-clamp-2 flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm leading-none! outline-none select-none",
                  value === option.value && "bg-accent text-accent-foreground"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 size-4 shrink-0",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.isOther ? (
                  <span className="flex items-center gap-1 font-medium italic">
                    <Plus className="h-3 w-3" />
                    {option.label}
                  </span>
                ) : (
                  option.label
                )}
              </button>
            ))}
            {allowCustom &&
              search &&
              !normalizedOptions.some(
                (o) =>
                  o.value.toLowerCase() === search.toLowerCase() ||
                  o.label.toLowerCase() === search.toLowerCase()
              ) && (
                <button
                  onClick={() => handleSelect(search)}
                  className="hover:bg-accent hover:text-accent-foreground text-primary relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm font-medium outline-none select-none"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter {`"${search}"`}
                </button>
              )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
