import { sql, SQL } from 'drizzle-orm';

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(
    params: PaginationParams,
    defaults: { page: number; pageSize: number } = { page: 1, pageSize: 25 }
): { page: number; pageSize: number; offset: number; limit: number } {
    const page = Math.max(1, params.page || defaults.page);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || defaults.pageSize));
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    return { page, pageSize, offset, limit };
}

/**
 * Create pagination metadata from total count
 */
export function createPaginationMeta(
    total: number,
    page: number,
    pageSize: number
): PaginationMeta {
    const totalPages = Math.ceil(total / pageSize);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): PaginatedResult<T> {
    return {
        data,
        pagination: createPaginationMeta(total, page, pageSize),
    };
}

/**
 * Generate page numbers for display
 * Returns an array of page numbers with ellipsis markers
 */
export function generatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 7
): (number | "ellipsis")[] {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const sidePages = Math.floor((maxVisible - 3) / 2);

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - sidePages);
    let end = Math.min(totalPages - 1, currentPage + sidePages);

    // Adjust if at the beginning
    if (currentPage <= sidePages + 2) {
        end = Math.min(totalPages - 1, maxVisible - 2);
    }

    // Adjust if at the end
    if (currentPage >= totalPages - sidePages - 1) {
        start = Math.max(2, totalPages - maxVisible + 3);
    }

    // Add ellipsis before middle section if needed
    if (start > 2) {
        pages.push("ellipsis");
    }

    // Add middle section
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    // Add ellipsis after middle section if needed
    if (end < totalPages - 1) {
        pages.push("ellipsis");
    }

    // Always show last page
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return pages;
}

/**
 * Build URL with pagination params
 */
export function buildPaginatedUrl(
    baseUrl: string,
    page: number,
    pageSize: number,
    otherParams?: Record<string, string | number | undefined>
): string {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));

    if (otherParams) {
        Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.pathname + url.search;
}

/**
 * Parse pagination from URL search params
 */
export function parsePaginationFromSearchParams(
    searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
    defaults: { page: number; pageSize: number } = { page: 1, pageSize: 25 }
): { page: number; pageSize: number } {
    const getParam = (key: string): string | undefined => {
        if (searchParams instanceof URLSearchParams) {
            return searchParams.get(key) || undefined;
        }
        const value = searchParams[key];
        return Array.isArray(value) ? value[0] : value;
    };

    const page = parseInt(getParam("page") || String(defaults.page), 10);
    const pageSize = parseInt(getParam("pageSize") || String(defaults.pageSize), 10);

    return {
        page: isNaN(page) || page < 1 ? defaults.page : page,
        pageSize: isNaN(pageSize) || pageSize < 1 || pageSize > 100 ? defaults.pageSize : pageSize,
    };
}

/**
 * Cursor-based pagination helpers
 */
export interface CursorPaginationParams {
    cursor?: string;
    limit?: number;
    direction?: "forward" | "backward";
}

export interface CursorPaginatedResult<T> {
    data: T[];
    cursors: {
        next: string | null;
        previous: string | null;
        hasMore: boolean;
    };
}

export function encodeCursor(data: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(data)).toString("base64url");
}

export function decodeCursor<T = Record<string, unknown>>(cursor: string): T | null {
    try {
        return JSON.parse(Buffer.from(cursor, "base64url").toString());
    } catch {
        return null;
    }
}

/**
 * Offset pagination SQL helper
 */
export function withPagination<T>(
    query: T,
    offset: number,
    limit: number
): T {
    // This is a placeholder - actual implementation depends on the query builder
    // In Drizzle, you'd use .limit(limit).offset(offset)
    return query;
}

/**
 * Count SQL helper for Drizzle
 */
export function countRows(): SQL<number> {
    return sql<number>`count(*)`;
}
