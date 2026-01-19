"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
    "h-full rounded-full transition-all duration-500 ease-out",
    {
        variants: {
            variant: {
                default: "bg-zinc-900 dark:bg-zinc-50",
                success: "bg-emerald-500",
                warning: "bg-amber-500",
                danger: "bg-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface ProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
    value: number;
    max?: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
    animated?: boolean;
}

const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
};

export function Progress({
    value,
    max = 100,
    variant,
    showLabel = false,
    size = "md",
    animated = true,
    className,
    ...props
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn("relative w-full", className)} {...props}>
            {showLabel && (
                <div className="flex justify-between text-xs text-zinc-500 mb-1 dark:text-zinc-400">
                    <span>Progresso</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div
                className={cn(
                    "w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800",
                    sizeClasses[size]
                )}
            >
                <div
                    className={cn(
                        progressVariants({ variant }),
                        animated && "transition-all duration-700 ease-out"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// === Circular Progress ===
interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    variant?: "default" | "success" | "warning" | "danger";
    className?: string;
}

const variantColors = {
    default: "#18181b", // zinc-900
    success: "#10B981", // emerald-500
    warning: "#F59E0B", // amber-500
    danger: "#EF4444",  // red-500
};

export function CircularProgress({
    value,
    max = 100,
    size = 48,
    strokeWidth = 4,
    showLabel = false,
    variant = "default",
    className,
}: CircularProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-zinc-200 dark:text-zinc-800"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={variant === 'default' ? 'currentColor' : variantColors[variant]} // Use currentColor for default to support dark mode via css or hardcode if needed
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn("transition-all duration-500 ease-out", variant === 'default' && "text-zinc-900 dark:text-zinc-50")}
                />
            </svg>
            {showLabel && (
                <span className="absolute text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}

// === Steps Progress ===
interface Step {
    label: string;
    description?: string;
}

interface StepsProgressProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function StepsProgress({ steps, currentStep, className }: StepsProgressProps) {
    return (
        <div className={cn("flex items-center w-full", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <React.Fragment key={index}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
                                    isCompleted && "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-900",
                                    isCurrent && "border-zinc-900 text-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:text-zinc-50 dark:bg-zinc-900",
                                    !isCompleted && !isCurrent && "border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={cn(
                                    "text-sm font-medium",
                                    isCurrent ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
                                )}>
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-zinc-400 mt-0.5 dark:text-zinc-500">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div
                                    className={cn(
                                        "h-0.5 transition-all duration-300",
                                        index < currentStep ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200 dark:bg-zinc-800"
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

