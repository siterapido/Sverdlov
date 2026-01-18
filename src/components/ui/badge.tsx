"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary-100 text-primary-700",
                secondary: "border-transparent bg-bg-tertiary text-fg-secondary",
                success: "border-transparent bg-success-400/20 text-success-600",
                warning: "border-transparent bg-warning-400/20 text-warning-600",
                danger: "border-transparent bg-danger-400/20 text-danger-600",
                outline: "border-border-default text-fg-primary bg-transparent",
                gradient: "border-transparent bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px]",
                default: "px-2.5 py-0.5 text-xs",
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
    pulse?: boolean;
    dot?: boolean;
    dotColor?: "success" | "warning" | "danger" | "primary";
}

const dotColors = {
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    primary: "bg-primary-500",
};

function Badge({
    className,
    variant,
    size,
    pulse = false,
    dot = false,
    dotColor = "primary",
    children,
    ...props
}: BadgeProps) {
    return (
        <div
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}
        >
            {dot && (
                <span className="relative mr-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[dotColor])} />
                    {pulse && (
                        <motion.span
                            className={cn(
                                "absolute inset-0 h-1.5 w-1.5 rounded-full",
                                dotColors[dotColor]
                            )}
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}
                </span>
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
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full",
                "bg-danger-500 text-white text-[10px] font-bold px-1.5",
                className
            )}
        >
            {displayCount}
        </motion.span>
    );
}

// === STATUS BADGE ===
type StatusType = "online" | "offline" | "busy" | "away";

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    className?: string;
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
    online: { color: "bg-success-500", label: "Online" },
    offline: { color: "bg-fg-tertiary", label: "Offline" },
    busy: { color: "bg-danger-500", label: "Ocupado" },
    away: { color: "bg-warning-500", label: "Ausente" },
};

function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={cn("inline-flex items-center gap-1.5", className)}>
            <span className="relative flex h-2 w-2">
                <span className={cn("h-2 w-2 rounded-full", config.color)} />
                {status === "online" && (
                    <motion.span
                        className={cn("absolute inset-0 rounded-full", config.color)}
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </span>
            {label !== undefined ? label : config.label}
        </span>
    );
}

export { Badge, badgeVariants, NotificationBadge, StatusBadge };
