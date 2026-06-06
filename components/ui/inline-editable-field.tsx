"use client";

import React, { useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui";
import { _Translator } from "next-intl";

interface InlineEditableFieldProps {
  value: string;
  onSave?: (val: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean | number;
  disabled?: boolean;
  className?: string;
  type?: string;
  displayValue?: React.ReactNode;
  /** Translation function usually from useTranslation() */
  t: _Translator<Record<string, string>, never>;
  validate?: (val: string) => string | null;
  /** Optional custom editor component */
  renderEditor?: (props: {
    value: string;
    onChange: (val: string) => void;
    onSave: (val: string) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function InlineEditableField({
  value,
  onSave = () => Promise.resolve(),
  placeholder,
  multiline,
  className,
  disabled,
  type = "text",
  displayValue,
  t,
  validate,
  renderEditor,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync draft when external value changes (controlled-input pattern).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value);
  }, [value]);

  const handleCancel = () => {
    setDraft(value);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async (overrideValue?: string) => {
    const finalValue = overrideValue !== undefined ? overrideValue : draft;

    // Validate before saving
    if (validate) {
      const err = validate(finalValue);
      if (err) {
        setError(err);
        return;
      }
    }

    if (finalValue === value && overrideValue === undefined) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(finalValue);
      setIsEditing(false);
      setError(null);
    } catch {
      setDraft(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (val: string) => {
    setDraft(val);
    if (validate) {
      setError(validate(val));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="group/input relative flex min-h-8 w-full flex-col gap-1.5">
        <div className="relative flex w-full items-center">
          <div className="flex-1">
            {renderEditor ? (
              renderEditor({
                value: draft,
                onChange: handleChange,
                onSave: handleSave,
                onCancel: handleCancel,
                isSaving,
                error,
              })
            ) : multiline ? (
              <Textarea
                value={draft}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={() => !error && handleSave()}
                onKeyDown={handleKeyDown}
                className={cn(
                  "min-h-25 resize-none pr-8 text-sm focus-visible:ring-1",
                  error
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : "focus-visible:ring-primary/20",
                  className
                )}
                rows={typeof multiline === "number" ? multiline : 5}
                autoFocus
                disabled={isSaving}
              />
            ) : (
              <Input
                type={type}
                value={draft}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={() => !error && handleSave()}
                onKeyDown={handleKeyDown}
                className={cn(
                  "bg-background h-8 pr-8 text-sm focus-visible:ring-1",
                  error
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : "focus-visible:ring-primary/20",
                  className
                )}
                autoFocus
                disabled={isSaving}
              />
            )}
          </div>
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 pl-1">
            {isSaving ? (
              <Loader2 className="text-primary h-3 w-3 animate-spin" />
            ) : error ? (
              <X className="text-destructive h-3 w-3" />
            ) : (
              <Check className="text-success h-3 w-3 opacity-0 transition-opacity group-hover/input:opacity-100" />
            )}
          </div>
        </div>
        {error && (
          <p className="text-destructive animate-in fade-in slide-in-from-top-1 px-1 text-[10px] font-bold">
            {t(error)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={cn(
        "relative -ml-1.5 flex cursor-pointer gap-2 rounded px-1.5 py-0.5 transition-colors",
        multiline ? "items-start" : "items-center",
        !value && "text-muted-foreground/50 font-normal italic",
        {
          "group/field hover:bg-muted/50": !disabled,
        },
        className
      )}
    >
      <div
        className={cn("w-full flex-1", {
          "whitespace-pre-wrap": multiline,
          "truncate pr-1.5": !multiline,
        })}
      >
        {displayValue !== undefined
          ? displayValue
          : value || placeholder || "—"}
      </div>
      <Pencil className="absolute top-1 right-1 hidden size-3 shrink-0 opacity-50 group-hover/field:inline-block" />
    </div>
  );
}
