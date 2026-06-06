"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "@/lib/utils";
import { DataFilter, FilterField } from "./data-filter";
import { useTranslations } from "next-intl";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  display?: boolean;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor?: (item: T) => any;
}

export interface ServerPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  maxHeight?: string;
  getRowClassName?: (item: T) => string;
  filterFields?: FilterField[];
  onFilterChange?: (filters: Record<string, string | undefined>) => void;
  filters?: Record<string, string | undefined>;
  paginated?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  serverPagination?: ServerPaginationProps;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage,
  searchable = false,
  searchPlaceholder,
  className = "",
  onRowClick,
  isLoading = false,
  maxHeight,
  getRowClassName,
  filterFields,
  onFilterChange,
  filters: currentFilters = {},
  paginated = false,
  defaultPageSize = 50,
  pageSizeOptions = [50, 70, 90, 110],
  serverPagination,
}: DataTableProps<T>) {
  const isServerPaginated = !!serverPagination;
  const t = useTranslations("Common.DataTable");
  const finalEmptyMessage = emptyMessage || t("empty");

  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Handle sorting
  const handleSort = (columnKey: keyof T | null) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Filter data based on search query
  const filteredData = searchable
    ? data.filter((item) => {
        const searchString = searchQuery.toLowerCase();
        return columns.some((column) => {
          const value = column.accessor
            ? column.accessor(item)
            : item[column.key as keyof T];
          return String(value).toLowerCase().includes(searchString);
        });
      })
    : data;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column) return 0;

    const aValue = column.accessor ? column.accessor(a) : a[sortColumn];
    const bValue = column.accessor ? column.accessor(b) : b[sortColumn];

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination — server-side or client-side
  const effectivePageSizeOptions =
    serverPagination?.pageSizeOptions ?? pageSizeOptions;

  // Server-side pagination: parent controls everything
  const srvPage = serverPagination?.page ?? 1;
  const srvPageSize = serverPagination?.pageSize ?? defaultPageSize;
  const srvTotal = serverPagination?.totalCount ?? 0;

  // Client-side pagination calculations
  const clientTotalItems = sortedData.length;
  const clientTotalPages = paginated
    ? Math.max(1, Math.ceil(clientTotalItems / pageSize))
    : 1;
  const clientSafePage = Math.min(currentPage, clientTotalPages);
  const clientPaginatedData = paginated
    ? sortedData.slice(
        (clientSafePage - 1) * pageSize,
        clientSafePage * pageSize
      )
    : sortedData;

  // Unified values for the UI
  const displayData = isServerPaginated ? sortedData : clientPaginatedData;
  const totalItems = isServerPaginated ? srvTotal : clientTotalItems;
  const totalPages = isServerPaginated
    ? Math.max(1, Math.ceil(srvTotal / srvPageSize))
    : clientTotalPages;
  const activePage = isServerPaginated ? srvPage : clientSafePage;
  const activePageSize = isServerPaginated ? srvPageSize : pageSize;
  const startItem = totalItems > 0 ? (activePage - 1) * activePageSize + 1 : 0;
  const endItem = isServerPaginated
    ? Math.min(activePage * activePageSize, srvTotal)
    : paginated
      ? Math.min(clientSafePage * pageSize, clientTotalItems)
      : clientTotalItems;
  const showPagination = isServerPaginated || (paginated && totalItems > 0);

  // Handlers
  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize);
    if (isServerPaginated) {
      serverPagination!.onPageSizeChange(size);
    } else {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    if (isServerPaginated) {
      serverPagination!.onPageChange(Math.max(1, srvPage - 1));
    } else {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (isServerPaginated) {
      serverPagination!.onPageChange(Math.min(totalPages, srvPage + 1));
    } else {
      setCurrentPage((p) => Math.min(clientTotalPages, p + 1));
    }
  };

  return (
    <div className={className}>
      {/* Filters and Search Toolbar */}
      {(searchable || (filterFields && filterFields.length > 0)) && (
        <div className="bg-card/30 border-border/50 mb-4 flex flex-col gap-2 rounded-lg border p-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {searchable && (
              <div className="relative min-w-60 flex-1 md:flex-none">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder ?? t("search")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-background/50 border-border/50 focus-visible:ring-primary/20 h-9 pl-9 focus-visible:ring-1"
                />
              </div>
            )}

            {filterFields && filterFields.length > 0 && onFilterChange && (
              <DataFilter
                fields={filterFields}
                onFilterChange={onFilterChange}
                currentFilters={currentFilters}
              />
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="h-full min-h-96 overflow-hidden rounded-md border">
        <Table wrapperClassName={maxHeight}>
          <TableHeader className="bg-background outline-1r outline-borderr sticky top-0 z-10 shadow-sm -outline-offset-1">
            <TableRow>
              {columns.map((column) => {
                if (column.display !== false)
                  return (
                    <TableHead
                      key={column.key as string}
                      className={
                        column.sortable ? "cursor-pointer select-none" : ""
                      }
                      onClick={() =>
                        column.sortable && handleSort(column.key as keyof T)
                      }
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && (
                          <div className="flex flex-col">
                            {sortColumn === column.key ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )
                            ) : (
                              <div className="h-4 w-4 opacity-20">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
              })}
            </TableRow>
          </TableHeader>
          <TableBody
            className={cn({
              "last:border-b": !isLoading || displayData.length,
            })}
          >
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
                    <span className="text-muted-foreground">
                      {t("loading")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayData.length > 0 ? (
              displayData.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={cn(
                    onRowClick
                      ? "hover:bg-muted/50 cursor-pointer transition-colors"
                      : "",
                    getRowClassName?.(item)
                  )}
                >
                  {columns.map((column) => {
                    if (column.display !== false)
                      return (
                        <TableCell key={String(column.key)}>
                          {column.render
                            ? column.render(item)
                            : String(
                                column.accessor
                                  ? column.accessor(item)
                                  : item[column.key as keyof T]
                              )}
                        </TableCell>
                      );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {finalEmptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="mt-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            {t("showingRange", {
              start: startItem,
              end: endItem,
              total: totalItems,
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {t("rowsPerPage")}
              </span>
              <Select
                value={String(activePageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-17.5 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {effectivePageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {t("pageOf", { page: activePage, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={activePage <= 1}
                onClick={handlePrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={activePage >= totalPages}
                onClick={handleNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results count (search only, when not paginated) */}
      {!paginated && searchable && searchQuery && (
        <div className="text-muted-foreground mt-2 text-sm">
          {t("resultCount", { count: sortedData.length, total: data.length })}
        </div>
      )}
    </div>
  );
}
