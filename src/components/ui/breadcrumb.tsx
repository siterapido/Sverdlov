"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    showHome?: boolean;
    homeHref?: string;
    maxItems?: number;
    className?: string;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
    ({
        items,
        separator,
        showHome = true,
        homeHref = "/",
        maxItems = 0,
        className,
    }, ref) => {
        const separatorElement = separator || (
            <ChevronRight className="h-4 w-4 text-zinc-400 mx-2 shrink-0" />
        );

        // Handle items truncation
        const displayItems = React.useMemo(() => {
            if (maxItems <= 0 || items.length <= maxItems) {
                return { items, truncated: false };
            }

            // Keep first and last items, collapse middle
            const first = items.slice(0, 1);
            const last = items.slice(-(maxItems - 1));

            return {
                items: [...first, { label: "...", isEllipsis: true }, ...last],
                truncated: true,
            };
        }, [items, maxItems]);

        const allItems: (BreadcrumbItem & { isEllipsis?: boolean })[] = showHome
            ? [{ label: "Início", href: homeHref, icon: <Home className="h-4 w-4" /> }, ...displayItems.items]
            : displayItems.items;

        return (
            <nav
                ref={ref}
                aria-label="Breadcrumb"
                className={cn("flex items-center", className)}
            >
                <ol className="flex items-center flex-wrap">
                    {allItems.map((item, index) => {
                        const isLast = index === allItems.length - 1;
                        const isEllipsis = (item as { isEllipsis?: boolean }).isEllipsis;

                        return (
                            <li key={index} className="flex items-center">
                                {isEllipsis ? (
                                    // Ellipsis item
                                    <span className="flex items-center text-sm text-zinc-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </span>
                                ) : item.href && !isLast ? (
                                    // Link item
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm transition-colors",
                                            "text-zinc-500 dark:text-zinc-400",
                                            "hover:text-zinc-900 dark:hover:text-zinc-100"
                                        )}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    // Current/last item
                                    <span
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm",
                                            isLast
                                                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                                : "text-zinc-500 dark:text-zinc-400"
                                        )}
                                        aria-current={isLast ? "page" : undefined}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </span>
                                )}

                                {/* Separator */}
                                {!isLast && separatorElement}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }
);
Breadcrumb.displayName = "Breadcrumb";

// === BREADCRUMB WITH DROPDOWN (for collapsed items) ===
export interface BreadcrumbDropdownProps extends BreadcrumbProps {
    collapsedItems?: BreadcrumbItem[];
}

const BreadcrumbWithDropdown = React.forwardRef<HTMLElement, BreadcrumbDropdownProps>(
    ({
        items,
        collapsedItems = [],
        separator,
        showHome = true,
        homeHref = "/",
        className,
    }, ref) => {
        const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        const separatorElement = separator || (
            <ChevronRight className="h-4 w-4 text-zinc-400 mx-2 shrink-0" />
        );

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const allItems = showHome
            ? [{ label: "Início", href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
            : items;

        const hasCollapsedItems = collapsedItems.length > 0;

        return (
            <nav
                ref={ref}
                aria-label="Breadcrumb"
                className={cn("flex items-center", className)}
            >
                <ol className="flex items-center flex-wrap">
                    {/* First item (home) */}
                    {allItems.length > 0 && (
                        <li className="flex items-center">
                            {allItems[0].href ? (
                                <Link
                                    href={allItems[0].href}
                                    className={cn(
                                        "flex items-center gap-1.5 text-sm transition-colors",
                                        "text-zinc-500 dark:text-zinc-400",
                                        "hover:text-zinc-900 dark:hover:text-zinc-100"
                                    )}
                                >
                                    {allItems[0].icon}
                                    <span>{allItems[0].label}</span>
                                </Link>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                    {allItems[0].icon}
                                    <span>{allItems[0].label}</span>
                                </span>
                            )}
                            {(allItems.length > 1 || hasCollapsedItems) && separatorElement}
                        </li>
                    )}

                    {/* Collapsed items dropdown */}
                    {hasCollapsedItems && (
                        <li className="flex items-center relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {isDropdownOpen && (
                                <div ref={dropdownRef} className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg py-1 min-w-[150px]">
                                    {collapsedItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href || "#"}
                                            className="block px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {allItems.length > 1 && separatorElement}
                        </li>
                    )}

                    {/* Remaining items */}
                    {allItems.slice(1).map((item, index) => {
                        const isLast = index === allItems.length - 2;

                        return (
                            <li key={index} className="flex items-center">
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm transition-colors",
                                            "text-zinc-500 dark:text-zinc-400",
                                            "hover:text-zinc-900 dark:hover:text-zinc-100"
                                        )}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm",
                                            isLast
                                                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                                : "text-zinc-500 dark:text-zinc-400"
                                        )}
                                        aria-current={isLast ? "page" : undefined}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </span>
                                )}

                                {!isLast && separatorElement}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }
);
BreadcrumbWithDropdown.displayName = "BreadcrumbWithDropdown";

export { Breadcrumb, BreadcrumbWithDropdown };
