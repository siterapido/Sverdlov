"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
    "h-full rounded-none transition-all duration-700 ease-in-out",
    {
        variants: {
            variant: {
                default: "bg-primary",
                success: "bg-emerald-500",
                warning: "bg-amber-500",
                danger: "bg-red-600",
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
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5",
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
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                    <span>PROGRESSO</span>
                    <span className="text-zinc-900 tabular-nums">{Math.round(percentage)}%</span>
                </div>
            )}
            <div
                className={cn(
                    "w-full rounded-none bg-zinc-50 border border-zinc-100 overflow-hidden",
                    sizeClasses[size]
                )}
            >
                <div
                    className={cn(
                        progressVariants({ variant }),
                        animated && "transition-all"
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
                    className="text-zinc-100"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={variant === 'default' ? '#0052FF' : variantColors[variant]} 
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-in-out"
                />
            </svg>
            {showLabel && (
                <span className="absolute text-[10px] font-black tabular-nums text-zinc-900">
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
                        {/* Step Square */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-none border-2 font-black transition-all",
                                    isCompleted && "bg-primary border-primary text-white shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)]",
                                    isCurrent && "border-zinc-900 text-zinc-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]",
                                    !isCompleted && !isCurrent && "border-zinc-100 text-zinc-300 bg-zinc-50"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    String(index + 1).padStart(2, '0')
                                )}
                            </div>
                            <div className="mt-4 text-center">
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    isCurrent ? "text-primary" : "text-zinc-500"
                                )}>
                                    {step.label}
                                </p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-0 -mt-6">
                                <div
                                    className={cn(
                                        "h-0.5 w-full transition-all",
                                        index < currentStep ? "bg-primary" : "bg-zinc-100"
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

