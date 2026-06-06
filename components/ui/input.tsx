import * as React from "react";

import { cn } from "@/lib/utils";
import { useLocalizedNumber } from "@/hooks";
import { useLocale } from "next-intl";

function Input({
  className,
  defaultValue,
  type,
  ...props
}: React.ComponentProps<"input">) {
  const commonClassName = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/50 border-input h-9 w-full min-w-0 rounded-md border bg-white/60 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    className
  );

  if (type === "number") {
    return (
      <NumberInput
        className={commonClassName}
        defaultValue={defaultValue}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      defaultValue={defaultValue}
      className={commonClassName}
      {...props}
    />
  );
}

// Internal component for handling numeric inputs and localized formating
function NumberInput({
  value,
  onChange,
  onFocus,
  onBlur,
  defaultValue,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const format = useLocalizedNumber();
  const locale = useLocale();
  const [localValue, setLocalValue] = React.useState<string>("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Controlled-input pattern: sync localValue when external `value` changes
  // while the field is not focused. The setState-in-effect is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const scalarValue = value as string | number | undefined;
    if (
      !isFocused &&
      scalarValue !== undefined &&
      scalarValue !== null &&
      scalarValue !== ""
    ) {
      setLocalValue(
        format(scalarValue, { useGrouping: false, maximumFractionDigits: 3 })
      );
    } else if (
      !isFocused &&
      (scalarValue === undefined || scalarValue === null || scalarValue === "")
    ) {
      setLocalValue("");
    }
  }, [value, isFocused, format]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!/^-?\d*[.,]?\d*$/.test(val) && val !== "") {
      e.target.value = localValue;
      return;
    }

    const isFr = locale.startsWith("fr");
    if (isFr && val.includes(".")) {
      e.target.value = localValue;
      return;
    }
    if (!isFr && val.includes(",")) {
      e.target.value = localValue;
      return;
    }

    setLocalValue(val);

    if (onChange) {
      const normalized = val.replace(",", ".");

      // Temporarily override the 'value' getter so React Hook Form receives the dot-separated string
      // natively without mutating the physical DOM value, which destroys cursor position and prevents commas.
      const origGetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      );
      Object.defineProperty(e.target, "value", {
        get: () => normalized,
        configurable: true,
      });

      onChange(e);

      // Restore native getter immediately after RHF processes it
      if (origGetter) {
        Object.defineProperty(e.target, "value", origGetter);
      } else {
        delete (e.target as unknown as { value?: unknown }).value;
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    const scalarValue = value as string | number | undefined;
    if (
      scalarValue !== undefined &&
      scalarValue !== null &&
      scalarValue !== ""
    ) {
      const decimalSeparator = format(1.1).includes(",") ? "," : ".";
      setLocalValue(String(scalarValue).replace(".", decimalSeparator));
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const scalarValue = value as string | number | undefined;
    if (
      scalarValue !== undefined &&
      scalarValue !== null &&
      scalarValue !== ""
    ) {
      setLocalValue(
        format(scalarValue, { useGrouping: false, maximumFractionDigits: 6 })
      );
    } else if (localValue !== "") {
      const numericStr = localValue.replace(",", ".");
      const parsed = parseFloat(numericStr);
      if (!isNaN(parsed)) {
        const newFormatted = format(parsed, {
          useGrouping: false,
          maximumFractionDigits: 6,
        });
        setLocalValue(newFormatted);
        e.target.value = newFormatted; // Visually update uncontrolled browser DOM state
      }
    }
    if (onBlur) onBlur(e);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      data-slot="input"
      value={value !== undefined && value !== "NaN" ? localValue : undefined}
      defaultValue={
        defaultValue !== undefined
          ? format(defaultValue as string | number, {
              useGrouping: false,
              maximumFractionDigits: 6,
            })
          : undefined
      }
      className={className}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}

export { Input };
