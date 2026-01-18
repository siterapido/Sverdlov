"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

// === CARD VARIANTS ===
type CardVariant = "default" | "glass" | "gradient" | "elevated" | "outline";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    variant?: CardVariant;
    hover?: boolean;
    glow?: boolean;
    children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
    default: "bg-bg-secondary border border-border-subtle",
    glass: "glass",
    gradient: "card-gradient",
    elevated: "bg-bg-secondary shadow-lg border-0",
    outline: "bg-transparent border-2 border-border-default",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", hover = true, glow = false, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-xl p-6 transition-all duration-200",
                    variantStyles[variant],
                    hover && "cursor-pointer",
                    glow && "hover-glow",
                    className
                )}
                whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                {...props}
            >
                {children}
            </motion.div>
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
            className={cn("flex flex-col space-y-1.5 pb-4", className)}
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
            className={cn("text-lg font-semibold leading-none tracking-tight text-fg-primary", className)}
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
        <div ref={ref} className={cn("", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

// === CARD FOOTER ===
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center pt-4 border-t border-border-subtle", className)}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";

// === STAT CARD ===
type StatCardVariant = "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger";

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    variant?: StatCardVariant;
    className?: string;
}

const statCardVariants: Record<StatCardVariant, string> = {
    default: "stat-card",
    primary: "stat-card-primary",
    secondary: "stat-card-secondary",
    accent: "stat-card-accent",
    success: "bg-gradient-to-br from-success-500 to-success-600 text-white",
    warning: "bg-gradient-to-br from-warning-400 to-warning-500 text-white",
    danger: "bg-gradient-to-br from-danger-400 to-danger-500 text-white",
};

function StatCard({ title, value, subtitle, icon, trend, variant = "default", className }: StatCardProps) {
    const isGradient = variant !== "default";

    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
                statCardVariants[variant],
                className
            )}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Decorative circles for gradient cards */}
            {isGradient && (
                <>
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
                </>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    {icon && (
                        <div className={cn(
                            "flex items-center justify-center h-10 w-10 rounded-xl",
                            isGradient ? "bg-white/20" : "bg-primary-100"
                        )}>
                            {icon}
                        </div>
                    )}
                    {trend && (
                        <span className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                            isGradient
                                ? "bg-white/20"
                                : trend.isPositive
                                    ? "bg-success-100 text-success-600"
                                    : "bg-danger-100 text-danger-600"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>

                <h3 className={cn(
                    "text-sm font-medium mb-1",
                    isGradient ? "text-white/80" : "text-fg-secondary"
                )}>
                    {title}
                </h3>

                <p className={cn(
                    "text-3xl font-bold tracking-tight",
                    isGradient ? "text-white" : "text-fg-primary"
                )}>
                    {value}
                </p>

                {subtitle && (
                    <p className={cn(
                        "text-xs mt-2",
                        isGradient ? "text-white/60" : "text-fg-tertiary"
                    )}>
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
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
