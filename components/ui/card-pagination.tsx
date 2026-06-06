"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function CardPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 12, 24, 48, 96],
  className,
}: CardPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  // if (totalPages <= 1 && totalCount <= pageSize) return null;

  const startRange = (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "border-border/40 flex flex-col items-center justify-between gap-4 border-t bg-zinc-50/50 p-4 md:flex-row md:rounded-xl md:border md:shadow-sm lg:p-6 dark:bg-zinc-900/50",
        className
      )}
    >
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <span className="hidden sm:inline-block">
          Affichage de{" "}
          <span className="text-foreground font-medium">{startRange}</span> à{" "}
          <span className="text-foreground font-medium">{endRange}</span> sur{" "}
          <span className="text-foreground font-medium">{totalCount}</span>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline-block">Par page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => onPageSizeChange(parseInt(val))}
            >
              <SelectTrigger className="bg-background/50 border-border/50 h-8 w-17.5">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="border-border/50 bg-background/50 hover:bg-background h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <div
                key={`ellipsis-${i}`}
                className="text-muted-foreground flex h-8 w-8 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            ) : (
              <Button
                key={`page-${p}`}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 font-medium",
                  page === p
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="border-border/50 bg-background/50 hover:bg-background h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
