"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg",
                gradient: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md hover:shadow-lg hover:brightness-110",
                glow: "bg-primary-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]",
                secondary: "bg-bg-tertiary text-fg-primary hover:bg-bg-hover",
                destructive: "bg-danger-500 text-white hover:bg-danger-600 shadow-md",
                outline: "border border-border-default bg-transparent text-fg-primary hover:bg-bg-hover hover:border-primary-500",
                ghost: "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary",
                link: "text-primary-500 underline-offset-4 hover:underline",
                glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
                success: "bg-success-500 text-white hover:bg-success-600 shadow-md",
            },
            size: {
                sm: "h-8 px-3 text-xs rounded-md",
                default: "h-10 px-4",
                lg: "h-12 px-6 text-base",
                xl: "h-14 px-8 text-lg rounded-xl",
                icon: "h-10 w-10 p-0",
                "icon-sm": "h-8 w-8 p-0",
                "icon-lg": "h-12 w-12 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant,
        size,
        asChild = false,
        loading = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading;

        if (asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref as React.RefObject<HTMLElement>}
                    {...(props as React.HTMLAttributes<HTMLElement>)}
                >
                    {children}
                </Slot>
            );
        }

        return (
            <motion.button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.02, y: -1 } : undefined}
                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {rightIcon && !loading && (
                    <span className="shrink-0">{rightIcon}</span>
                )}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

// === ICON BUTTON ===
interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
    icon: React.ReactNode;
    "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, size = "icon", variant = "ghost", ...props }, ref) => {
        return (
            <Button ref={ref} variant={variant} size={size} {...props}>
                {icon}
            </Button>
        );
    }
);
IconButton.displayName = "IconButton";

// === BUTTON GROUP ===
interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
    attached?: boolean;
}

function ButtonGroup({ children, className, attached = false }: ButtonGroupProps) {
    if (attached) {
        return (
            <div className={cn(
                "inline-flex",
                "[&>button]:rounded-none",
                "[&>button:first-child]:rounded-l-lg",
                "[&>button:last-child]:rounded-r-lg",
                "[&>button:not(:last-child)]:border-r-0",
                className
            )}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn("inline-flex gap-2", className)}>
            {children}
        </div>
    );
}

export { Button, buttonVariants, IconButton, ButtonGroup };
