"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
    "h-full rounded-full transition-all duration-500 ease-out",
    {
        variants: {
            variant: {
                default: "bg-primary-500",
                gradient: "bg-gradient-to-r from-primary-500 to-secondary-500",
                success: "bg-success-500",
                warning: "bg-warning-500",
                danger: "bg-danger-500",
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
                <div className="flex justify-between text-xs text-fg-secondary mb-1">
                    <span>Progresso</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div
                className={cn(
                    "w-full rounded-full bg-bg-tertiary overflow-hidden",
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
    variant?: "default" | "gradient" | "success" | "warning" | "danger";
    className?: string;
}

const variantColors = {
    default: "#6366F1",
    gradient: "url(#gradient)",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
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
                {variant === "gradient" && (
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>
                )}
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-bg-tertiary"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={variantColors[variant]}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showLabel && (
                <span className="absolute text-sm font-semibold text-fg-primary">
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
                                    isCompleted && "bg-primary-500 border-primary-500 text-white",
                                    isCurrent && "border-primary-500 text-primary-500 bg-primary-500/10",
                                    !isCompleted && !isCurrent && "border-border-default text-fg-tertiary"
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
                                    isCurrent ? "text-fg-primary" : "text-fg-secondary"
                                )}>
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-fg-tertiary mt-0.5">
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
                                        index < currentStep ? "bg-primary-500" : "bg-border-default"
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

