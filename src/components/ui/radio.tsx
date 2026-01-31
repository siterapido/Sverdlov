"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const radioVariants = cva(
    "shrink-0 rounded-full border-2 transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-zinc-300 dark:border-zinc-600",
                error: "border-red-500",
            },
            size: {
                sm: "h-4 w-4",
                default: "h-5 w-5",
                lg: "h-6 w-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface RadioGroupProps extends VariantProps<typeof radioVariants> {
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({
        options,
        value,
        onChange,
        orientation = "vertical",
        disabled = false,
        error,
        className,
        name,
        variant,
        size,
    }, ref) => {
        const computedVariant = error ? "error" : variant;

        const handleChange = (optionValue: string) => {
            if (!disabled) {
                onChange?.(optionValue);
            }
        };

        const dotSize = size === "sm" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5";

        return (
            <div ref={ref} className={className} role="radiogroup">
                <div className={cn(
                    "flex gap-4",
                    orientation === "vertical" && "flex-col gap-3",
                    orientation === "horizontal" && "flex-row flex-wrap"
                )}>
                    {options.map(option => {
                        const isSelected = value === option.value;
                        const isDisabled = disabled || option.disabled;

                        return (
                            <label
                                key={option.value}
                                className={cn(
                                    "flex items-start gap-3 cursor-pointer",
                                    isDisabled && "cursor-not-allowed opacity-50"
                                )}
                            >
                                {/* Hidden native input */}
                                <input
                                    type="radio"
                                    checked={isSelected}
                                    onChange={() => handleChange(option.value)}
                                    disabled={isDisabled}
                                    name={name}
                                    value={option.value}
                                    className="peer sr-only"
                                />

                                {/* Custom radio */}
                                <span
                                    className={cn(
                                        radioVariants({ variant: computedVariant, size }),
                                        isSelected && "border-primary"
                                    )}
                                >
                                    {isSelected && (
                                        <span className={cn(dotSize, "rounded-full bg-primary")} />
                                    )}
                                </span>

                                {/* Label and description */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs mt-2 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
RadioGroup.displayName = "RadioGroup";

// === RADIO CARD GROUP (alternative visual style) ===
export interface RadioCardGroupProps {
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    columns?: 1 | 2 | 3 | 4;
}

const RadioCardGroup = React.forwardRef<HTMLDivElement, RadioCardGroupProps>(
    ({
        options,
        value,
        onChange,
        disabled = false,
        error,
        className,
        name,
        columns = 1,
    }, ref) => {
        const handleChange = (optionValue: string) => {
            if (!disabled) {
                onChange?.(optionValue);
            }
        };

        const gridCols = {
            1: "grid-cols-1",
            2: "grid-cols-1 sm:grid-cols-2",
            3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        };

        return (
            <div ref={ref} className={className} role="radiogroup">
                <div className={cn("grid gap-3", gridCols[columns])}>
                    {options.map(option => {
                        const isSelected = value === option.value;
                        const isDisabled = disabled || option.disabled;

                        return (
                            <label
                                key={option.value}
                                className={cn(
                                    "relative flex items-start p-4 border-2 transition-all cursor-pointer",
                                    "hover:border-zinc-300 dark:hover:border-zinc-600",
                                    isSelected && "border-primary bg-primary/5",
                                    !isSelected && "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                                    isDisabled && "cursor-not-allowed opacity-50"
                                )}
                            >
                                {/* Hidden native input */}
                                <input
                                    type="radio"
                                    checked={isSelected}
                                    onChange={() => handleChange(option.value)}
                                    disabled={isDisabled}
                                    name={name}
                                    value={option.value}
                                    className="sr-only"
                                />

                                {/* Radio indicator */}
                                <span
                                    className={cn(
                                        "shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3",
                                        isSelected ? "border-primary" : "border-zinc-300 dark:border-zinc-600"
                                    )}
                                >
                                    {isSelected && (
                                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                    )}
                                </span>

                                {/* Label and description */}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {option.description}
                                        </span>
                                    )}
                                </div>

                                {/* Selection indicator corner */}
                                {isSelected && (
                                    <span className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-primary border-l-[20px] border-l-transparent" />
                                )}
                            </label>
                        );
                    })}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs mt-2 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
RadioCardGroup.displayName = "RadioCardGroup";

export { RadioGroup, RadioCardGroup, radioVariants };
