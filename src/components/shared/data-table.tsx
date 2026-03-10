"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"

export interface ColumnDef<T> {
  key: string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface FilterConfig {
  key: string
  label: string
  options: { label: string; value: string }[]
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
  }
  sorting?: {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    onSort: (sortBy: string, sortOrder: "asc" | "desc") => void
  }
  search?: {
    placeholder?: string
    value: string
    onChange: (value: string) => void
  }
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  onRowClick?: (row: T) => void
  emptyState?: {
    title: string
    description?: string
  }
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pagination,
  sorting,
  search,
  filters,
  filterValues,
  onFilterChange,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1

  const handleSort = (key: string) => {
    if (!sorting) return
    const newOrder =
      sorting.sortBy === key && sorting.sortOrder === "asc" ? "desc" : "asc"
    sorting.onSort(key, newOrder)
  }

  const getSortIcon = (key: string) => {
    if (!sorting || sorting.sortBy !== key) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
    }
    return sorting.sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    )
  }

  const renderPaginationButtons = () => {
    if (!pagination) return null
    const pages: number[] = []
    const start = Math.max(1, pagination.page - 2)
    const end = Math.min(totalPages, pagination.page + 2)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages.map((p) => (
      <Button
        key={p}
        variant={p === pagination.page ? "default" : "outline"}
        size="icon"
        className="h-8 w-8"
        onClick={() => pagination.onPageChange(p)}
      >
        {p}
      </Button>
    ))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(search || (filters && filters.length > 0)) && (
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50/60 p-3 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
          {search && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={search.placeholder || "Search..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950"
              />
            </div>
          )}
          {filters && filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={filterValues?.[filter.key] || "all"}
                  onValueChange={(value) =>
                    onFilterChange?.(filter.key, value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="h-9 w-[150px] bg-white dark:bg-slate-950">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 overflow-hidden dark:border-slate-800/60">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <button
                      className="inline-flex items-center hover:text-slate-900 dark:hover:text-slate-50"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination?.pageSize || 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <EmptyState
                    title={emptyState?.title || "No results found"}
                    description={emptyState?.description}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={(row.id as string) || index}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : (row[column.key] as React.ReactNode) ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>
              Showing{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {(pagination.page - 1) * pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {Math.min(pagination.page * pagination.pageSize, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pagination.total}
              </span>{" "}
              results
            </span>
            {pagination.onPageSizeChange && (
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  pagination.onPageSizeChange?.(Number(value))
                }
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Page{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {totalPages}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 disabled:opacity-40"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page <= 1}
                aria-label="Go to first page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 disabled:opacity-40"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {renderPaginationButtons()}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 disabled:opacity-40"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                aria-label="Go to next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 disabled:opacity-40"
                onClick={() => pagination.onPageChange(totalPages)}
                disabled={pagination.page >= totalPages}
                aria-label="Go to last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
