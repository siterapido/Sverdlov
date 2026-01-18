"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none",
    {
        variants: {
            variant: {
                // Primary - Azul Notion
                default: "bg-accent text-white hover:bg-accent-hover rounded-[4px]",
                // Ghost - Transparente com hover
                ghost: "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary rounded-[4px]",
                // Secondary - Fundo cinza
                secondary: "bg-bg-hover text-fg-primary hover:bg-bg-active rounded-[4px]",
                // Outline - Apenas borda
                outline: "border border-border-default bg-transparent text-fg-primary hover:bg-bg-hover rounded-[4px]",
                // Destructive - Vermelho
                destructive: "bg-danger text-white hover:opacity-90 rounded-[4px]",
                // Link - Texto simples
                link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
                // Success
                success: "bg-success text-white hover:opacity-90 rounded-[4px]",
            },
            size: {
                sm: "h-7 px-2 text-xs",
                default: "h-8 px-3",
                lg: "h-9 px-4",
                icon: "h-7 w-7 p-0",
                "icon-sm": "h-6 w-6 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
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
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isDisabled}
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
            </Comp>
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
    ({ icon, size = "icon", variant = "ghost", className, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn("rounded-[4px]", className)}
                {...props}
            >
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
                "[&>button:first-child]:rounded-l-[4px]",
                "[&>button:last-child]:rounded-r-[4px]",
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
