"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const switchVariants = cva(
    "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "h-5 w-9",
                default: "h-6 w-11",
                lg: "h-7 w-14",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const thumbVariants = cva(
    "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                default: "h-5 w-5",
                lg: "h-6 w-6",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

export interface SwitchProps extends VariantProps<typeof switchVariants> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    id?: string;
    labelPosition?: "left" | "right";
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({
        checked = false,
        onChange,
        label,
        description,
        disabled = false,
        error,
        className,
        size,
        name,
        id,
        labelPosition = "right",
    }, ref) => {
        const handleClick = () => {
            if (!disabled) {
                onChange?.(!checked);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleClick();
            }
        };

        const translateX = {
            sm: checked ? "translate-x-4" : "translate-x-0",
            default: checked ? "translate-x-5" : "translate-x-0",
            lg: checked ? "translate-x-7" : "translate-x-0",
        };

        const switchElement = (
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                id={id}
                className={cn(
                    switchVariants({ size }),
                    checked ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700",
                    className
                )}
            >
                <span
                    className={cn(
                        thumbVariants({ size }),
                        translateX[size || "default"]
                    )}
                />
            </button>
        );

        // Hidden input for form submission
        const hiddenInput = (
            <input
                type="hidden"
                name={name}
                value={checked ? "true" : "false"}
            />
        );

        if (!label && !description) {
            return (
                <>
                    {hiddenInput}
                    {switchElement}
                    {error && (
                        <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </>
            );
        }

        const labelContent = (
            <div className="flex flex-col">
                {label && (
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {label}
                    </span>
                )}
                {description && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {description}
                    </span>
                )}
            </div>
        );

        return (
            <div className={cn(disabled && "opacity-50")}>
                {hiddenInput}
                <label className={cn(
                    "flex items-center gap-3 cursor-pointer",
                    disabled && "cursor-not-allowed"
                )}>
                    {labelPosition === "left" && labelContent}
                    {switchElement}
                    {labelPosition === "right" && labelContent}
                </label>
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Switch.displayName = "Switch";

// === SWITCH GROUP ===
export interface SwitchGroupOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface SwitchGroupProps {
    options: SwitchGroupOption[];
    value?: string[];
    onChange?: (values: string[]) => void;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    size?: "sm" | "default" | "lg";
}

const SwitchGroup = React.forwardRef<HTMLDivElement, SwitchGroupProps>(
    ({
        options,
        value = [],
        onChange,
        disabled = false,
        error,
        className,
        name,
        size,
    }, ref) => {
        const handleChange = (optionValue: string, checked: boolean) => {
            if (checked) {
                onChange?.([...value, optionValue]);
            } else {
                onChange?.(value.filter(v => v !== optionValue));
            }
        };

        return (
            <div ref={ref} className={className}>
                <div className="space-y-3">
                    {options.map(option => (
                        <Switch
                            key={option.value}
                            checked={value.includes(option.value)}
                            onChange={(checked) => handleChange(option.value, checked)}
                            label={option.label}
                            description={option.description}
                            disabled={disabled || option.disabled}
                            name={name}
                            size={size}
                        />
                    ))}
                </div>
                {error && (
                    <p className="text-xs mt-2 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
SwitchGroup.displayName = "SwitchGroup";

export { Switch, SwitchGroup, switchVariants };
