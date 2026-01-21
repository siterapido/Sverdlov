"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-zinc-900 text-white hover:bg-zinc-800",
                secondary:
                    "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                destructive:
                    "border-transparent bg-red-600 text-white hover:bg-red-700",
                outline: "text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
                blue: "border-transparent bg-primary text-white hover:brightness-110",
                green: "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                yellow: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
                red: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
                gray: "border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
            },
            size: {
                sm: "px-1.5 py-0 text-[9px]",
                default: "px-2.5 py-0.5",
                lg: "px-3 py-1 text-xs",
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
