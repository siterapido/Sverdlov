"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";

const checkboxVariants = cva(
    "shrink-0 border-2 transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
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

export interface CheckboxProps extends VariantProps<typeof checkboxVariants> {
    checked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    id?: string;
    value?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({
        checked = false,
        indeterminate = false,
        onChange,
        label,
        description,
        disabled = false,
        error,
        className,
        variant,
        size,
        name,
        id,
        value,
    }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const computedVariant = error ? "error" : variant;

        // Merge refs
        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        // Handle indeterminate state
        React.useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.checked);
        };

        const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";

        return (
            <div className={cn("relative", className)}>
                <label className={cn(
                    "flex items-start gap-3 cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50"
                )}>
                    {/* Hidden native input */}
                    <input
                        ref={inputRef}
                        type="checkbox"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        name={name}
                        id={id}
                        value={value}
                        className="peer sr-only"
                    />

                    {/* Custom checkbox */}
                    <span
                        className={cn(
                            checkboxVariants({ variant: computedVariant, size }),
                            "rounded-none", // Brutalista style
                            (checked || indeterminate) && "bg-primary border-primary",
                            !checked && !indeterminate && "bg-white dark:bg-zinc-900"
                        )}
                    >
                        {checked && !indeterminate && (
                            <Check className={cn(iconSize, "text-white")} strokeWidth={3} />
                        )}
                        {indeterminate && (
                            <Minus className={cn(iconSize, "text-white")} strokeWidth={3} />
                        )}
                    </span>

                    {/* Label and description */}
                    {(label || description) && (
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
                    )}
                </label>

                {/* Error message */}
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400 ml-8">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Checkbox.displayName = "Checkbox";

// === CHECKBOX GROUP ===
export interface CheckboxGroupOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface CheckboxGroupProps {
    options: CheckboxGroupOption[];
    value?: string[];
    onChange?: (values: string[]) => void;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    size?: "sm" | "default" | "lg";
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
    ({
        options,
        value = [],
        onChange,
        orientation = "vertical",
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
                <div className={cn(
                    "flex gap-4",
                    orientation === "vertical" && "flex-col gap-3",
                    orientation === "horizontal" && "flex-row flex-wrap"
                )}>
                    {options.map(option => (
                        <Checkbox
                            key={option.value}
                            checked={value.includes(option.value)}
                            onChange={(checked) => handleChange(option.value, checked)}
                            label={option.label}
                            description={option.description}
                            disabled={disabled || option.disabled}
                            name={name}
                            value={option.value}
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
CheckboxGroup.displayName = "CheckboxGroup";

export { Checkbox, CheckboxGroup, checkboxVariants };
