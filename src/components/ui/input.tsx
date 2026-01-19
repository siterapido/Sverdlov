"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Search, X } from "lucide-react";

const inputVariants = cva(
    "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
    {
        variants: {
            variant: {
                default: "",
                error: "border-red-500 focus-visible:ring-red-500 dark:border-red-900",
                success: "border-emerald-500 focus-visible:ring-emerald-500 dark:border-emerald-900",
            },
            inputSize: {
                sm: "h-9 px-3 text-xs",
                default: "h-10 px-3",
                lg: "h-11 px-4",
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none">
                        {leftIcon}
                    </div>
                )}

                <input
                    type={isPassword && showPassword ? "text" : type}
                    className={cn(
                        inputVariants({ variant: computedVariant, inputSize }),
                        leftIcon && "pl-10",
                        (rightIcon || isPassword || (showClear && hasValue)) && "pr-10",
                        className
                    )}
                    ref={ref}
                    value={value}
                    {...props}
                />

                {/* Right Side Icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Clear Button */}
                    {showClear && hasValue && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Password Toggle */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {/* Custom Right Icon */}
                    {rightIcon && !isPassword && (
                        <span className="text-zinc-500 dark:text-zinc-400 pointer-events-none">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Error/Success Messages */}
                {(error || success) && (
                    <p className={cn(
                        "text-xs mt-1.5 font-medium",
                        error && "text-red-500 dark:text-red-400",
                        success && "text-emerald-500 dark:text-emerald-400"
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
                leftIcon={<Search className="h-4 w-4" />}
                showClear={true}
                onClear={onClear}
                onKeyDown={handleKeyDown}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn("bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800", className)}
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
                        "min-h-[80px] py-2 resize-none h-auto",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {(error || success) && (
                    <p className={cn(
                        "text-xs mt-1.5 font-medium",
                        error && "text-red-500 dark:text-red-400",
                        success && "text-emerald-500 dark:text-emerald-400"
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
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100 mb-2 block",
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="text-red-500 ml-0.5">*</span>}
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
