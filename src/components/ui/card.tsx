"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// === CARD ===
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    bordered?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, bordered = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg bg-bg-primary",
                    bordered && "border border-border-default",
                    hover && "cursor-pointer transition-colors duration-100 hover:bg-bg-hover",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";

// === CARD HEADER ===
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1 p-4 pb-2", className)}
            {...props}
        />
    )
);
CardHeader.displayName = "CardHeader";

// === CARD TITLE ===
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-sm font-medium text-fg-primary", className)}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

// === CARD DESCRIPTION ===
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-fg-secondary", className)}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

// === CARD CONTENT ===
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

// === CARD FOOTER ===
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center p-4 pt-0", className)}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";

// === STAT CARD (Notion Style) ===
type StatCardVariant = "default" | "blue" | "green" | "yellow" | "red";

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    variant?: StatCardVariant;
    className?: string;
}

const statCardVariants: Record<StatCardVariant, { bg: string; icon: string }> = {
    default: { bg: "bg-bg-tertiary", icon: "text-fg-secondary" },
    blue: { bg: "bg-accent-light", icon: "text-accent" },
    green: { bg: "bg-success-light", icon: "text-success" },
    yellow: { bg: "bg-warning-light", icon: "text-warning" },
    red: { bg: "bg-danger-light", icon: "text-danger" },
};

function StatCard({ title, value, subtitle, icon, trend, variant = "default", className }: StatCardProps) {
    const styles = statCardVariants[variant];

    return (
        <div
            className={cn(
                "rounded-lg border border-border-default bg-bg-primary p-4",
                className
            )}
        >
            <div className="flex items-start justify-between mb-3">
                {icon && (
                    <div className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-md",
                        styles.bg
                    )}>
                        <span className={styles.icon}>{icon}</span>
                    </div>
                )}
                {trend && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-sm",
                        trend.isPositive
                            ? "bg-success-light text-success"
                            : "bg-danger-light text-danger"
                    )}>
                        {trend.isPositive ? "+" : ""}{trend.value}%
                    </span>
                )}
            </div>

            <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-1">
                {title}
            </p>

            <p className="text-2xl font-semibold text-fg-primary">
                {value}
            </p>

            {subtitle && (
                <p className="text-xs text-fg-muted mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    StatCard
};
