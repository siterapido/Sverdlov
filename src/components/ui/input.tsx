"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Search, X } from "lucide-react";

const inputVariants = cva(
    "flex w-full rounded-[4px] border bg-bg-primary text-sm text-fg-primary transition-colors duration-100 placeholder:text-fg-placeholder disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none",
    {
        variants: {
            variant: {
                default: "border-border-default hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-light)]",
                error: "border-danger focus:border-danger focus:shadow-[0_0_0_2px_var(--color-danger-light)]",
                success: "border-success focus:border-success focus:shadow-[0_0_0_2px_var(--color-success-light)]",
            },
            inputSize: {
                sm: "h-7 px-2 text-xs",
                default: "h-8 px-3",
                lg: "h-9 px-4",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default",
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    success?: string;
    showClear?: boolean;
    onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        type = "text",
        variant,
        inputSize,
        leftIcon,
        rightIcon,
        error,
        success,
        showClear = false,
        onClear,
        value,
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === "password";
        const hasValue = value !== undefined && value !== "";

        // Auto-detect variant based on error/success
        const computedVariant = error ? "error" : success ? "success" : variant;

        return (
            <div className="relative w-full">
                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
                        {leftIcon}
                    </div>
                )}

                <input
                    type={isPassword && showPassword ? "text" : type}
                    className={cn(
                        inputVariants({ variant: computedVariant, inputSize }),
                        leftIcon && "pl-8",
                        (rightIcon || isPassword || (showClear && hasValue)) && "pr-8",
                        className
                    )}
                    ref={ref}
                    value={value}
                    {...props}
                />

                {/* Right Side Icons */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Clear Button */}
                    {showClear && hasValue && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-fg-muted hover:text-fg-secondary transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {/* Password Toggle */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-fg-muted hover:text-fg-secondary transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                                <Eye className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}

                    {/* Custom Right Icon */}
                    {rightIcon && !isPassword && (
                        <span className="text-fg-muted pointer-events-none">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Error/Success Messages */}
                {(error || success) && (
                    <p className={cn(
                        "text-xs mt-1",
                        error && "text-danger",
                        success && "text-success"
                    )}>
                        {error || success}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

// === SEARCH INPUT ===
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
    onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ onClear, onSearch, value, onChange, placeholder = "Search...", className, ...props }, ref) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && onSearch && typeof value === "string") {
                onSearch(value);
            }
        };

        return (
            <Input
                ref={ref}
                type="search"
                leftIcon={<Search className="h-3.5 w-3.5" />}
                showClear={true}
                onClear={onClear}
                onKeyDown={handleKeyDown}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn("bg-bg-secondary", className)}
                {...props}
            />
        );
    }
);
SearchInput.displayName = "SearchInput";

// === TEXTAREA ===
interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
    error?: string;
    success?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, error, success, ...props }, ref) => {
        const computedVariant = error ? "error" : success ? "success" : variant;

        return (
            <div className="relative w-full">
                <textarea
                    className={cn(
                        inputVariants({ variant: computedVariant }),
                        "min-h-[80px] py-2 resize-none",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {(error || success) && (
                    <p className={cn(
                        "text-xs mt-1",
                        error && "text-danger",
                        success && "text-success"
                    )}>
                        {error || success}
                    </p>
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

// === FORM LABEL ===
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, required, children, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    "text-xs font-medium text-fg-secondary mb-1 block uppercase tracking-wide",
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="text-danger ml-0.5">*</span>}
            </label>
        );
    }
);
Label.displayName = "Label";

// === FORM GROUP ===
interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

function FormGroup({ children, className }: FormGroupProps) {
    return (
        <div className={cn("space-y-1", className)}>
            {children}
        </div>
    );
}

export { Input, inputVariants, SearchInput, Textarea, Label, FormGroup };
