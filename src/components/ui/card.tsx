"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// === CARD ===
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
                    "rounded-sm bg-white text-zinc-900",
                    bordered && "border border-zinc-200",
                    hover && "cursor-pointer transition-colors hover:bg-zinc-50",
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
            className={cn("flex flex-col space-y-1.5 p-6", className)}
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
            className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
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
            className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

// === CARD CONTENT ===
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

// === CARD FOOTER ===
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";

// === STAT CARD (Modern Style) ===
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

const statCardVariants: Record<StatCardVariant, { indicator: string }> = {
    default: { indicator: "bg-zinc-900" },
    blue: { indicator: "bg-blue-500" },
    green: { indicator: "bg-emerald-500" },
    yellow: { indicator: "bg-amber-500" },
    red: { indicator: "bg-red-500" },
};

function StatCard({ title, value, subtitle, icon, trend, variant = "default", className }: StatCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-sm border border-zinc-200 bg-white p-6 overflow-hidden",
                className
            )}
        >
            <div className="flex items-center justify-between space-y-0 pb-2 border-b border-zinc-50 mb-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {title}
                </p>
                {icon && (
                    <div className="text-zinc-400">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-zinc-900 tracking-tighter">
                    {value}
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-sm border",
                        trend.isPositive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100"
                    )}>
                        {trend.isPositive ? "+" : ""}{trend.value}%
                    </span>
                )}
            </div>

            {subtitle && (
                <p className="text-[11px] text-zinc-400 mt-2 font-medium">
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
