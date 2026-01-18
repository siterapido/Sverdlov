"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Search, X } from "lucide-react";

const inputVariants = cva(
    "flex w-full rounded-lg border bg-bg-secondary text-sm transition-all duration-200 placeholder:text-fg-tertiary disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-border-subtle focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                filled: "border-transparent bg-bg-tertiary focus:bg-bg-secondary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                glass: "bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20",
                error: "border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20",
                success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
            },
            inputSize: {
                sm: "h-8 px-3 text-xs",
                default: "h-10 px-4",
                lg: "h-12 px-5 text-base",
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none">
                        {leftIcon}
                    </div>
                )}

                <input
                    type={isPassword && showPassword ? "text" : type}
                    className={cn(
                        inputVariants({ variant: computedVariant, inputSize }),
                        leftIcon && "pl-10",
                        (rightIcon || isPassword || (showClear && hasValue)) && "pr-10",
                        "focus:outline-none",
                        className
                    )}
                    ref={ref}
                    value={value}
                    {...props}
                />

                {/* Right Side Icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Clear Button */}
                    {showClear && hasValue && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-fg-tertiary hover:text-fg-secondary transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Password Toggle */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-fg-tertiary hover:text-fg-secondary transition-colors"
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
                        <span className="text-fg-tertiary pointer-events-none">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {(error || success) && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className={cn(
                                "text-xs mt-1.5",
                                error && "text-danger-500",
                                success && "text-success-500"
                            )}
                        >
                            {error || success}
                        </motion.p>
                    )}
                </AnimatePresence>
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
    ({ onClear, onSearch, value, onChange, ...props }, ref) => {
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
                        "min-h-[100px] py-3 resize-none focus:outline-none",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <AnimatePresence>
                    {(error || success) && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className={cn(
                                "text-xs mt-1.5",
                                error && "text-danger-500",
                                success && "text-success-500"
                            )}
                        >
                            {error || success}
                        </motion.p>
                    )}
                </AnimatePresence>
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
                    "text-sm font-medium text-fg-primary mb-1.5 block",
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="text-danger-500 ml-1">*</span>}
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
        <div className={cn("space-y-1.5", className)}>
            {children}
        </div>
    );
}

export { Input, inputVariants, SearchInput, Textarea, Label, FormGroup };
