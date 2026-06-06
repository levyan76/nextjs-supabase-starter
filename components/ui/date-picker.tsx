"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { formatDateWithOffset, parseToLocal } from "@/lib/date-utils";

interface DatePickerProps {
  date?: string | null;
  setDate: (date?: Date, dateIso?: string | null) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  children?: React.ReactNode;
  disabledPastDate?: boolean;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Sélectionner une date",
  disabled,
  className,
  children,
  disabledPastDate = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const locale = useLocale();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate, formatDateWithOffset(selectedDate) || null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              dayjs(date).locale(locale).format("LL")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parseToLocal(date)}
          onSelect={handleSelect}
          disabled={(date) =>
            (disabled && disabled(date)) || disabledPastDate
              ? dayjs(date).isBefore(dayjs().startOf("day"))
              : false
          }
        />
      </PopoverContent>
    </Popover>
  );
}
