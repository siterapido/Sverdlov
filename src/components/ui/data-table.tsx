"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";
import { Button } from "./button";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    minWidth?: string;
    align?: "left" | "center" | "right";
    render?: (row: T, index: number) => React.ReactNode;
    headerRender?: () => React.ReactNode;
}

export interface DataTableProps<T extends { id?: string | number }> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    selectable?: boolean;
    selectedRows?: T[];
    onSelectionChange?: (selected: T[]) => void;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        onPageChange: (page: number) => void;
        onPageSizeChange?: (pageSize: number) => void;
        pageSizeOptions?: number[];
    };
    sortColumn?: string;
    sortDirection?: SortDirection;
    onSort?: (key: string, direction: SortDirection) => void;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    onRowClick?: (row: T, index: number) => void;
    rowClassName?: (row: T, index: number) => string;
    stickyHeader?: boolean;
    className?: string;
    containerClassName?: string;
    getRowId?: (row: T) => string | number;
}

function DataTable<T extends { id?: string | number }>({
    data,
    columns,
    loading = false,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    pagination,
    sortColumn,
    sortDirection,
    onSort,
    emptyMessage = "Nenhum resultado encontrado",
    emptyIcon,
    onRowClick,
    rowClassName,
    stickyHeader = false,
    className,
    containerClassName,
    getRowId,
}: DataTableProps<T>) {
    const getId = (row: T, index: number): string | number => {
        if (getRowId) return getRowId(row);
        if (row.id !== undefined) return row.id;
        return index;
    };

    const isSelected = (row: T, index: number): boolean => {
        const rowId = getId(row, index);
        return selectedRows.some((selected, i) => getId(selected, i) === rowId);
    };

    const allSelected = data.length > 0 && data.every((row, i) => isSelected(row, i));
    const someSelected = data.some((row, i) => isSelected(row, i)) && !allSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange?.(data);
        } else {
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (row: T, index: number, checked: boolean) => {
        const rowId = getId(row, index);
        if (checked) {
            onSelectionChange?.([...selectedRows, row]);
        } else {
            onSelectionChange?.(selectedRows.filter((selected, i) => getId(selected, i) !== rowId));
        }
    };

    const handleSort = (key: string) => {
        if (!onSort) return;

        let newDirection: SortDirection;
        if (sortColumn !== key) {
            newDirection = "asc";
        } else if (sortDirection === "asc") {
            newDirection = "desc";
        } else if (sortDirection === "desc") {
            newDirection = null;
        } else {
            newDirection = "asc";
        }

        onSort(key, newDirection);
    };

    const getValue = (row: T, key: keyof T | string): unknown => {
        const keys = String(key).split(".");
        let value: unknown = row;
        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k];
        }
        return value;
    };

    const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

    const SortIcon = ({ column }: { column: Column<T> }) => {
        if (!column.sortable) return null;

        const key = String(column.key);
        if (sortColumn !== key) {
            return <ChevronsUpDown className="h-4 w-4 text-zinc-400" />;
        }
        if (sortDirection === "asc") {
            return <ChevronUp className="h-4 w-4 text-primary" />;
        }
        if (sortDirection === "desc") {
            return <ChevronDown className="h-4 w-4 text-primary" />;
        }
        return <ChevronsUpDown className="h-4 w-4 text-zinc-400" />;
    };

    return (
        <div className={cn("w-full", containerClassName)}>
            {/* Table container */}
            <div className="overflow-auto border border-zinc-200 dark:border-zinc-700">
                <table className={cn("w-full border-collapse", className)}>
                    <thead className={cn(
                        "bg-zinc-50 dark:bg-zinc-800",
                        stickyHeader && "sticky top-0 z-10"
                    )}>
                        <tr>
                            {/* Selection column */}
                            {selectable && (
                                <th className="w-12 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                                    <Checkbox
                                        checked={allSelected}
                                        indeterminate={someSelected}
                                        onChange={handleSelectAll}
                                        size="sm"
                                    />
                                </th>
                            )}

                            {/* Data columns */}
                            {columns.map((column, colIndex) => (
                                <th
                                    key={colIndex}
                                    className={cn(
                                        "px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700",
                                        column.align === "center" && "text-center",
                                        column.align === "right" && "text-right",
                                        column.sortable && "cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 select-none"
                                    )}
                                    style={{
                                        width: column.width,
                                        minWidth: column.minWidth,
                                    }}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className={cn(
                                        "flex items-center gap-1",
                                        column.align === "center" && "justify-center",
                                        column.align === "right" && "justify-end"
                                    )}>
                                        {column.headerRender ? column.headerRender() : column.header}
                                        <SortIcon column={column} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {/* Loading state */}
                        {loading && (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    {selectable && (
                                        <td className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <Skeleton className="h-5 w-5" />
                                        </td>
                                    )}
                                    {columns.map((_, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
                                        >
                                            <Skeleton className="h-5 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}

                        {/* Empty state */}
                        {!loading && data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        {emptyIcon && (
                                            <div className="text-zinc-400">
                                                {emptyIcon}
                                            </div>
                                        )}
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {emptyMessage}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data rows */}
                        {!loading && data.map((row, rowIndex) => (
                            <tr
                                key={getId(row, rowIndex)}
                                className={cn(
                                    "transition-colors",
                                    "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                    isSelected(row, rowIndex) && "bg-primary/5",
                                    onRowClick && "cursor-pointer",
                                    rowClassName?.(row, rowIndex)
                                )}
                                onClick={() => onRowClick?.(row, rowIndex)}
                            >
                                {/* Selection cell */}
                                {selectable && (
                                    <td
                                        className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={isSelected(row, rowIndex)}
                                            onChange={(checked) => handleSelectRow(row, rowIndex, checked)}
                                            size="sm"
                                        />
                                    </td>
                                )}

                                {/* Data cells */}
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            "px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800",
                                            column.align === "center" && "text-center",
                                            column.align === "right" && "text-right"
                                        )}
                                    >
                                        {column.render
                                            ? column.render(row, rowIndex)
                                            : String(getValue(row, column.key) ?? "-")
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-x border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    {/* Page size selector */}
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Mostrando</span>
                        {pagination.onPageSizeChange ? (
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                                className="h-8 px-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="font-medium">{pagination.pageSize}</span>
                        )}
                        <span>de {pagination.total} resultados</span>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => pagination.onPageChange(pageNum)}
                                        className={cn(
                                            "h-8 w-8 flex items-center justify-center text-sm transition-colors",
                                            pagination.page === pageNum
                                                ? "bg-primary text-white font-medium"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export { DataTable };
export type { Column as DataTableColumn };
