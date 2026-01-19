"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/80",
                secondary:
                    "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
                destructive:
                    "border-transparent bg-red-500 text-zinc-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-900/80",
                outline: "text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800",
                blue: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300",
                green: "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-300",
                yellow: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-300",
                red: "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-300",
                gray: "border-transparent bg-zinc-100 text-zinc-700 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-300",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px]",
                default: "px-2.5 py-0.5",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
    dotColor?: "blue" | "green" | "yellow" | "red" | "gray";
}

const dotColors = {
    blue: "bg-accent",
    green: "bg-success",
    yellow: "bg-warning",
    red: "bg-danger",
    gray: "bg-fg-muted",
};

function Badge({
    className,
    variant,
    size,
    dot = false,
    dotColor = "blue",
    children,
    ...props
}: BadgeProps) {
    return (
        <div
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}
        >
            {dot && (
                <span className={cn(
                    "h-1.5 w-1.5 rounded-full mr-1.5",
                    dotColors[dotColor]
                )} />
            )}
            {children}
        </div>
    );
}

// === NOTIFICATION BADGE ===
interface NotificationBadgeProps {
    count: number;
    max?: number;
    className?: string;
}

function NotificationBadge({ count, max = 99, className }: NotificationBadgeProps) {
    const displayCount = count > max ? `${max}+` : count;

    if (count === 0) return null;

    return (
        <span
            className={cn(
                "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full",
                "bg-danger text-white text-[10px] font-medium px-1",
                className
            )}
        >
            {displayCount}
        </span>
    );
}

// === STATUS BADGE ===
type StatusType = "online" | "offline" | "busy" | "away";

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    showLabel?: boolean;
    className?: string;
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
    online: { color: "bg-success", label: "Online" },
    offline: { color: "bg-fg-muted", label: "Offline" },
    busy: { color: "bg-danger", label: "Ocupado" },
    away: { color: "bg-warning", label: "Ausente" },
};

function StatusBadge({ status, label, showLabel = true, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={cn("inline-flex items-center gap-1.5 text-sm text-fg-secondary", className)}>
            <span className={cn("h-2 w-2 rounded-full", config.color)} />
            {showLabel && (label !== undefined ? label : config.label)}
        </span>
    );
}

export { Badge, badgeVariants, NotificationBadge, StatusBadge };
